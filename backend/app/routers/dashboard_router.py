from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.document import Document

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_documents = db.query(Document).count()

    books = (
        db.query(Document)
        .filter(Document.category == "Book")
        .count()
    )

    research_papers = (
        db.query(Document)
        .filter(Document.category == "Research Paper")
        .count()
    )

    scanned_pdfs = (
        db.query(Document)
        .filter(Document.category == "Scanned PDF")
        .count()
    )

    active_researchers = (
        db.query(func.count(func.distinct(Document.author)))
        .scalar()
    )

    return {
        "total_documents": total_documents,
        "books": books,
        "research_papers": research_papers,
        "scanned_pdfs": scanned_pdfs,
        "active_researchers": active_researchers,
    }
@router.get("/recent")
def get_recent_uploads(db: Session = Depends(get_db)):
    documents = (
        db.query(Document)
        .order_by(Document.id.desc())
        .limit(5)
        .all()
    )

    def derive_ocr_status(doc) -> str:
        if not doc.is_scanned:
            return "text"
        if doc.ocr_completed:
            return "completed"
        return "pending"

    return [
        {
            "id": doc.id,
            "title": doc.title,
            "author": doc.author,
            "type": doc.category,
            "time": "Just now",
            "ocr_status": derive_ocr_status(doc),
            "ocr_page_current": doc.ocr_page_current,
            "ocr_page_total": doc.ocr_page_total,
        }
        for doc in documents
    ]