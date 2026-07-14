from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
from app.models.document import Document
from app.database.dependencies import get_db
from app.services.document_service import DocumentService
from app.schemas.document import DocumentResponse

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


def format_size(size: int) -> str:
    if size < 1024:
        return f"{size} B"
    elif size < 1024 * 1024:
        return f"{size / 1024:.1f} KB"
    else:
        return f"{size / (1024 * 1024):.1f} MB"


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


@router.get("/", response_model=list[DocumentResponse])
def get_documents(db: Session = Depends(get_db)):
    documents = DocumentService.get_all_documents(db)

    return [
        DocumentResponse(
            id=doc.id,
            title=doc.title,
            author=doc.author,
            department=doc.department,
            year=doc.publication_year,
            type=doc.category,
            fileName=doc.file_name,
            fileSize=format_size(doc.file_size),
            pages=doc.page_count,
            keywords=[],
            bookmarked=False,
        )
        for doc in documents
    ]
@router.get("/{document_id}/download")
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
):
    document = db.query(Document).filter(Document.id == document_id).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    return FileResponse(
        path=document.file_path,
        filename=document.file_name,
        media_type=document.mime_type,
    )
    
@router.get("/{document_id}/view")
def view_document(
    document_id: int,
    db: Session = Depends(get_db),
):
    document = db.query(Document).filter(Document.id == document_id).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    return FileResponse(
        path=document.file_path,
        media_type=document.mime_type,
        filename=document.file_name,
        content_disposition_type="inline",
    )