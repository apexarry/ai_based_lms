import os
import shutil
import uuid

import fitz
from fastapi import UploadFile, BackgroundTasks
from sqlalchemy.orm import Session
from app.services.rag_service import RAGService
from app.models.document import Document
from app.models.document_view import DocumentView
from app.services.chroma_service import ChromaService
from app.services.ocr_service import OcrService

UPLOAD_DIR = "uploads"


class DocumentService:

    @staticmethod
    def delete_document(
        db: Session,
        document_id: int,
    ):

        document = (
            db.query(Document)
            .filter(Document.id == document_id)
            .first()
        )

        if not document:
            return False

        # -----------------------------------------
        # Delete vectors from ChromaDB
        # -----------------------------------------

        chroma = ChromaService()
        chroma.delete_document(document.id)

        # -----------------------------------------
        # Delete PDF from uploads folder
        # -----------------------------------------

        if (
            document.file_path
            and os.path.exists(document.file_path)
        ):
            os.remove(document.file_path)

        # -----------------------------------------
        # Delete related view records
        # -----------------------------------------

        db.query(DocumentView).filter(
            DocumentView.document_id == document.id
        ).delete()

        # -----------------------------------------
        # Delete database record
        # -----------------------------------------

        db.delete(document)
        db.commit()

        return True

    @staticmethod
    def save_document(
        db: Session,
        title: str,
        author: str,
        department: str,
        category: str,
        publication_year: int,
        file: UploadFile,
        background_tasks: BackgroundTasks | None = None,
        owner_id: int | None = None,
    ):

        os.makedirs(UPLOAD_DIR, exist_ok=True)

        extension = os.path.splitext(file.filename)[1]
        unique_name = f"{uuid.uuid4()}{extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        page_count = 0
        extracted_text = ""

        if file.content_type == "application/pdf":
            try:
                with fitz.open(file_path) as pdf:

                    page_count = pdf.page_count
                    pages_text = []

                    for i, page in enumerate(pdf):
                        text = page.get_text().strip()
                        if text:
                            pages_text.append(f"--- PAGE {i + 1} ---\n{text}")

                    extracted_text = "\n\n".join(pages_text)

            except Exception as e:
                print("Could not process PDF:", e)

        is_scanned = False
        needs_ocr = False
        ocr_status = "text"

        if (
            file.content_type == "application/pdf"
            and page_count > 0
        ):
            text_len = len(extracted_text.strip())
            is_scanned = text_len < page_count * 20

            if is_scanned:
                needs_ocr = True
                ocr_status = "pending"

        document = Document(
            title=title,
            author=author,
            department=department,
            category=category,
            publication_year=publication_year,
            file_name=file.filename,
            file_path=file_path,
            file_size=os.path.getsize(file_path),
            mime_type=file.content_type,
            page_count=page_count,
            extracted_text=extracted_text,
            is_scanned=is_scanned,
            ocr_completed=False,
            owner_id=owner_id,
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        if needs_ocr and background_tasks:
            doc_id = document.id
            doc_path = file_path
            background_tasks.add_task(
                OcrService.process_document_background,
                document_id=doc_id,
                file_path=doc_path,
                page_count=page_count,
            )
            document.ocr_page_total = page_count
            print(f"Queued OCR for document {doc_id} ({title}) — {page_count} pages")

        elif extracted_text.strip():

            print("Indexing document into ChromaDB...")

            document.extracted_text = extracted_text

            rag = RAGService()
            rag.index_document(document)
            db.commit()
            db.refresh(document)

        document.ocr_status = ocr_status
        return document

    @staticmethod
    def get_all_documents(db: Session):
        return db.query(Document).all()

    @staticmethod
    def reindex_documents(db: Session):
        """Rebuild vectors so existing uploads benefit from indexing changes."""
        indexed, skipped, failed = 0, 0, []
        rag = RAGService()

        for document in db.query(Document).all():
            if not (document.extracted_text or "").strip():
                skipped += 1
                continue
            try:
                rag.index_document(document)
                db.commit()
                indexed += 1
            except Exception as exc:
                db.rollback()
                failed.append({"id": document.id, "title": document.title, "error": str(exc)})

        return {"indexed": indexed, "skipped": skipped, "failed": failed}
