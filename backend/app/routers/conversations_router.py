import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.conversation import Conversation, Message
from app.models.user import User
from app.dependencies.auth import get_current_user

router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"],
)


@router.get("/")
def list_conversations(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversations = (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": c.id,
            "title": c.title,
            "preview": c.preview,
            "date": c.updated_at.isoformat() if c.updated_at else None,
        }
        for c in conversations
    ]


@router.post("/")
def create_conversation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation = Conversation(
        title="New conversation",
        preview="",
        user_id=current_user.id,
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return {
        "id": conversation.id,
        "title": conversation.title,
        "preview": conversation.preview,
        "date": conversation.updated_at.isoformat() if conversation.updated_at else None,
    }


@router.get("/{conversation_id}")
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
):
    conversation = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id)
        .first()
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return {
        "id": conversation.id,
        "title": conversation.title,
        "preview": conversation.preview,
        "date": conversation.updated_at.isoformat() if conversation.updated_at else None,
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "citations": json.loads(m.citations) if m.citations else [],
                "timestamp": m.timestamp.isoformat() if m.timestamp else None,
            }
            for m in conversation.messages
        ],
    }


@router.put("/{conversation_id}")
def update_conversation(
    conversation_id: int,
    body: dict,
    db: Session = Depends(get_db),
):
    conversation = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id)
        .first()
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if "title" in body:
        conversation.title = body["title"]
    if "preview" in body:
        conversation.preview = body["preview"]

    conversation.updated_at = datetime.utcnow()
    db.commit()
    return {"updated": True}


@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
):
    conversation = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id)
        .first()
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    db.delete(conversation)
    db.commit()
    return {"deleted": True}
