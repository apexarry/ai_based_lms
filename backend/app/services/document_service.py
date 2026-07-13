import os
import shutil
import uuid

from fastapi import UploadFile
from sqlalchemy.orm import Session

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
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        return document

    @staticmethod
    def get_all_documents(db: Session):
        return db.query(Document).all()