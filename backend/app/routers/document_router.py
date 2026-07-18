from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
    HTTPException,
    BackgroundTasks,
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.document import Document
from app.models.bookmark import Bookmark
from app.models.user import User
from app.schemas.document import DocumentResponse
from app.services.document_service import DocumentService
from app.dependencies.auth import get_current_user


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


def format_size(size: int) -> str:
    if size < 1024:
        return f"{size} B"
    elif size < 1024 * 1024:
        return f"{size / 1024:.1f} KB"
    else:
        return f"{size / (1024 * 1024):.1f} MB"


# ==========================================================
# Upload
# ==========================================================

@router.post("/upload")
def upload_document(
    title: str = Form(...),
    author: str = Form(""),
    department: str = Form(""),
    category: str = Form(""),
    publication_year: int = Form(...),
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    document = DocumentService.save_document(
        db=db,
        title=title,
        author=author,
        department=department,
        category=category,
        publication_year=publication_year,
        file=file,
        background_tasks=background_tasks,
        owner_id=current_user.id,
    )

    return {
        "id": document.id,
        "title": document.title,
        "uploaded": True,
        "ocr_status": getattr(document, "ocr_status", "text"),
    }


# ==========================================================
# Get All Documents
# ==========================================================

@router.get("/", response_model=list[DocumentResponse])
def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    documents = DocumentService.get_all_documents(db)
    bookmarked_ids = set(
        r[0] for r in db.query(Bookmark.document_id)
        .filter(Bookmark.user_id == current_user.id)
        .all()
    )

    def derive_ocr_status(doc) -> str:
        if not doc.is_scanned:
            return "text"
        if doc.ocr_completed:
            return "completed"
        return "pending"

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
            bookmarked=doc.id in bookmarked_ids,
            owner_id=doc.owner_id,
            ocr_status=derive_ocr_status(doc),
            ocr_page_current=doc.ocr_page_current,
            ocr_page_total=doc.ocr_page_total,
        )
        for doc in documents
    ]


# ==========================================================
# Search
# ==========================================================

@router.get("/search")
def search_documents(
    q: str = "",
    db: Session = Depends(get_db),
):
    if not q.strip():
        return []

    results = (
        db.query(Document)
        .filter(
            (Document.title.ilike(f"%{q}%"))
            | (Document.author.ilike(f"%{q}%"))
        )
        .limit(10)
        .all()
    )

    return [
        {
            "id": doc.id,
            "title": doc.title,
            "author": doc.author,
        }
        for doc in results
    ]


# ==========================================================
# Bookmark toggle
# ==========================================================

@router.post("/{document_id}/bookmark")
def toggle_bookmark(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = (
        db.query(Bookmark)
        .filter(
            Bookmark.document_id == document_id,
            Bookmark.user_id == current_user.id,
        )
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()
        return {"bookmarked": False}
    else:
        bm = Bookmark(document_id=document_id, user_id=current_user.id)
        db.add(bm)
        db.commit()
        return {"bookmarked": True}


# ==========================================================
# List bookmarked documents
# ==========================================================

@router.get("/bookmarked")
def get_bookmarked_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc_ids = [
        r[0] for r in
        db.query(Bookmark.document_id)
        .filter(Bookmark.user_id == current_user.id)
        .order_by(Bookmark.created_at.desc())
        .all()
    ]
    if not doc_ids:
        return []

    from sqlalchemy import case
    ordering = case({id: i for i, id in enumerate(doc_ids)}, value=Document.id)
    documents = (
        db.query(Document)
        .filter(Document.id.in_(doc_ids))
        .order_by(ordering)
        .all()
    )

    def derive_ocr_status(doc) -> str:
        if not doc.is_scanned:
            return "text"
        if doc.ocr_completed:
            return "completed"
        return "pending"

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
            bookmarked=True,
            owner_id=doc.owner_id,
            ocr_status=derive_ocr_status(doc),
            ocr_page_current=doc.ocr_page_current,
            ocr_page_total=doc.ocr_page_total,
        )
        for doc in documents
    ]


@router.post("/reindex")
def reindex_documents(
    db: Session = Depends(get_db),
):
    """Rebuild all embeddings after an indexing-pipeline update."""
    return DocumentService.reindex_documents(db)


# ==========================================================
# Download
# ==========================================================

@router.get("/{document_id}/download")
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
):

    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    return FileResponse(
        path=document.file_path,
        filename=document.file_name,
        media_type=document.mime_type,
    )


# ==========================================================
# View
# ==========================================================

@router.get("/{document_id}/view")
def view_document(
    document_id: int,
    db: Session = Depends(get_db),
):

    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    return FileResponse(
        path=document.file_path,
        media_type=document.mime_type,
        filename=document.file_name,
        content_disposition_type="inline",
    )


# ==========================================================
# Delete
# ==========================================================

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    if document.owner_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own documents",
        )

    deleted = DocumentService.delete_document(
        db=db,
        document_id=document_id,
    )

    return {
        "message": "Document deleted successfully.",
    }
