import numpy as np
import fitz

from app.models.document import Document
from app.services.rag_service import RAGService


class OcrService:
    _reader = None

    @classmethod
    def get_reader(cls):
        if cls._reader is None:
            import easyocr
            cls._reader = easyocr.Reader(["en"])
        return cls._reader

    @staticmethod
    def process_document_background(document_id: int, file_path: str, page_count: int):
        from app.database.database import SessionLocal

        reader = OcrService.get_reader()
        db = SessionLocal()

        try:
            document = db.query(Document).filter(Document.id == document_id).first()
            if not document:
                return

            document.ocr_page_total = page_count
            document.ocr_page_current = 0
            document.is_scanned = True
            db.commit()

            full_text = []
            pdf = fitz.open(file_path)

            for page_num in range(page_count):
                page = pdf.load_page(page_num)
                pix = page.get_pixmap(dpi=300)
                img_array = np.frombuffer(pix.samples, dtype=np.uint8).reshape(
                    pix.height, pix.width, pix.n
                )

                result = reader.readtext(img_array)
                if result:
                    page_text = "\n".join(item[1] for item in result)
                    full_text.append(page_text)

                document.ocr_page_current = page_num + 1
                db.commit()

            pdf.close()

            extracted_text = "\n\n".join(full_text)
            document.extracted_text = extracted_text
            document.ocr_completed = True
            db.commit()

            if extracted_text.strip():
                rag = RAGService()
                rag.index_document(document)
                db.commit()

        except Exception as exc:
            print(f"OCR failed for document {document_id}: {exc}")
            try:
                doc = db.query(Document).filter(Document.id == document_id).first()
                if doc:
                    doc.ocr_completed = False
                    db.commit()
            except Exception:
                pass

        finally:
            db.close()
