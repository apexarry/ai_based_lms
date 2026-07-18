from datetime import datetime, date

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.document import Document
from app.models.document_view import DocumentView
from app.models.conversation import Message, Conversation
from app.models.bookmark import Bookmark
from app.models.user import User
from app.dependencies.auth import get_current_user

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/ai-questions-today")
def get_ai_questions_today(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    count = (
        db.query(func.count(Message.id))
        .join(Conversation, Message.conversation_id == Conversation.id)
        .filter(func.date(Message.timestamp) == today)
        .filter(Conversation.user_id == current_user.id)
        .scalar()
    )
    return {"count": count or 0}


@router.get("/trending")
def get_trending_topics(db: Session = Depends(get_db)):
    results = (
        db.query(
            DocumentView.document_id,
            Document.title,
            func.count(DocumentView.id).label("view_count"),
        )
        .join(Document, DocumentView.document_id == Document.id)
        .group_by(DocumentView.document_id, Document.title)
        .order_by(func.count(DocumentView.id).desc())
        .limit(5)
        .all()
    )
    return [
        {"id": r.document_id, "topic": r.title, "count": r.view_count}
        for r in results
    ]


@router.get("/profile")
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    name = current_user.name
    initials = "".join(p[0] for p in name.split() if p).upper()
    docs_read = (
        db.query(func.count(DocumentView.id))
        .join(Document, DocumentView.document_id == Document.id)
        .filter(Document.owner_id == current_user.id)
        .scalar()
    )
    conv_count = (
        db.query(func.count(Conversation.id))
        .filter(Conversation.user_id == current_user.id)
        .scalar()
    )
    bm_count = (
        db.query(func.count(Bookmark.id))
        .filter(Bookmark.user_id == current_user.id)
        .scalar()
    )
    return {
        "name": name,
        "initials": initials,
        "role": current_user.role,
        "documents_read": docs_read or 0,
        "conversations": conv_count or 0,
        "bookmarks": bm_count or 0,
    }


@router.get("/recently-viewed")
def get_recently_viewed(db: Session = Depends(get_db)):
    views = (
        db.query(DocumentView)
        .order_by(DocumentView.viewed_at.desc())
        .limit(5)
        .all()
    )
    results = []
    seen = set()
    for v in views:
        if v.document_id in seen:
            continue
        seen.add(v.document_id)
        d = v.document
        results.append({
            "id": d.id,
            "title": d.title,
            "author": d.author,
            "type": d.category,
            "time": v.viewed_at.isoformat() if v.viewed_at else "Just now",
        })
    return results


@router.post("/track-view/{document_id}")
def track_view(document_id: int, db: Session = Depends(get_db)):
    v = DocumentView(document_id=document_id)
    db.add(v)
    db.commit()
    return {"ok": True}


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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
def get_recent_uploads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    documents = (
        db.query(Document)
        .filter(Document.owner_id == current_user.id)
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