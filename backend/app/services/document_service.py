import os
import shutil
import uuid

import fitz
from fastapi import UploadFile
from sqlalchemy.orm import Session
from app.services.rag_service import RAGService
from app.models.document import Document


UPLOAD_DIR = "uploads"


class DocumentService:

    @staticmethod
    def save_document(
        db: Session,
        title: str,
        author: str,
        department: str,
        category: str,
        publication_year: int,
        file: UploadFile,
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

                    for page in pdf:
                        extracted_text += page.get_text()

            except Exception as e:
                print("Could not process PDF:", e)

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
        )

        db.add(document)
        db.commit()
        db.refresh(document)
        if extracted_text.strip():

            print("Indexing document into ChromaDB...")

            # Make sure the document object has the extracted text
            document.extracted_text = extracted_text

            rag = RAGService()

            rag.index_document(document)
        return document

    @staticmethod
    def get_all_documents(db: Session):
        return db.query(Document).all()