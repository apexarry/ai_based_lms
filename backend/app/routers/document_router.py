from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.services.document_service import DocumentService

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


@router.post("/upload")
def upload_document(
    title: str = Form(...),
    author: str = Form(""),
    department: str = Form(""),
    category: str = Form(""),
    publication_year: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    document = DocumentService.save_document(
        db=db,
        title=title,
        author=author,
        department=department,
        category=category,
        publication_year=publication_year,
        file=file,
    )

    return {
        "id": document.id,
        "title": document.title,
        "uploaded": True,
    }
    
@router.get("/")
def get_documents(db: Session = Depends(get_db)):
    documents = DocumentService.get_all_documents(db)

    return [
        {
            "id": doc.id,
            "title": doc.title,
            "author": doc.author,
            "department": doc.department,
            "category": doc.category,
            "publication_year": doc.publication_year,
            "file_name": doc.file_name,
        }
        for doc in documents
    ]