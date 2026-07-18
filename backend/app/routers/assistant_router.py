import json
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.conversation import Conversation, Message
from app.models.user import User
from app.schemas.assistant import QuestionRequest
from app.dependencies.auth import get_current_user

from app.services.retrieval_service import RetrievalService
from app.services.prompt_builder_service import PromptBuilderService
from app.services.llm_service import LLMService


router = APIRouter(
    prefix="/assistant",
    tags=["Assistant"],
)


retrieval_service = RetrievalService()
prompt_builder = PromptBuilderService()
llm = LLMService()


@router.post("/ask")
def ask_question(
    request: QuestionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # ==========================================================
    # Resolve conversation
    # ==========================================================

    conversation_id = request.conversation_id

    if conversation_id:
        conversation = (
            db.query(Conversation)
            .filter(Conversation.id == conversation_id)
            .first()
        )
        if not conversation:
            conversation = Conversation(user_id=current_user.id)
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
            conversation_id = conversation.id
        elif conversation.user_id != current_user.id:
            conversation = Conversation(user_id=current_user.id)
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
            conversation_id = conversation.id
    else:
        conversation = Conversation(user_id=current_user.id)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        conversation_id = conversation.id

    # ==========================================================
    # Build chat history for LLM
    # ==========================================================

    llm_messages = [
        {"role": "system", "content": "You are an expert research assistant."},
    ]

    for msg in conversation.messages:
        llm_messages.append({
            "role": msg.role,
            "content": msg.content,
        })

    # ==========================================================
    # Retrieve documents
    # ==========================================================

    retrieval = retrieval_service.retrieve(
        question=request.question,
        db=db,
    )

    query = retrieval["query"]
    results = retrieval["results"]
    has_results = (
        results.get("documents")
        and results["documents"][0]
    )

    # ==========================================================
    # Build prompt and get answer
    # ==========================================================

    sources = []

    if has_results:
        documents = results["documents"][0]
        metadata = results["metadatas"][0]

        def format_source_label(item) -> str:
            label = f"[Source: {item.get('title', 'Untitled document')}"
            page_start = item.get("page_start")
            page_end = item.get("page_end")
            if page_start is not None and page_end is not None:
                if page_start == page_end:
                    label += f" | Page {page_start}"
                else:
                    label += f" | Pages {page_start}–{page_end}"
            label += f" | {item.get('section', 'Section')}"
            label += f" | Chunk {item.get('chunk_id', 0) + 1}]"
            return label

        context = "\n\n".join(
            f"{format_source_label(item)}\n{chunk}"
            for chunk, item in zip(documents, metadata)
        )

        user_prompt = prompt_builder.build_prompt(
            question=request.question,
            context=context,
            intent=query["intent"],
            document=query["document"],
            documents=query.get("documents"),
        )

        llm_messages.append({
            "role": "user",
            "content": user_prompt,
        })

        # Build sources
        seen = set()
        page_map = {}

        for item in metadata:
            source_key = (item["title"], item["author"])
            p_start = item.get("page_start")
            p_end = item.get("page_end")

            if source_key not in page_map:
                page_map[source_key] = {"page_start": p_start, "page_end": p_end}
            else:
                cur = page_map[source_key]
                if p_start is not None:
                    if cur["page_start"] is None or p_start < cur["page_start"]:
                        cur["page_start"] = p_start
                if p_end is not None:
                    if cur["page_end"] is None or p_end > cur["page_end"]:
                        cur["page_end"] = p_end

            if source_key not in seen:
                seen.add(source_key)
                sources.append({
                    "title": item["title"],
                    "author": item["author"],
                    "category": item["category"],
                    "department": item["department"],
                    "publication_year": item["publication_year"],
                    "page_start": None,
                    "page_end": None,
                })

        for s in sources:
            key = (s["title"], s["author"])
            if key in page_map:
                s["page_start"] = page_map[key]["page_start"]
                s["page_end"] = page_map[key]["page_end"]

    else:
        # -------------------------------------------------------
        # No retrieval results — fall back to conversation memory
        # -------------------------------------------------------
        if len(conversation.messages) > 0:
            llm_messages.append({
                "role": "user",
                "content": request.question,
            })
        else:
            return {
                "question": request.question,
                "answer": "I couldn't find any relevant documents.",
                "sources": [],
                "conversation_id": conversation_id,
            }

    # ==========================================================
    # Generate answer
    # ==========================================================

    answer = llm.answer_question(messages=llm_messages)

    # ==========================================================
    # Save messages to conversation
    # ==========================================================

    user_msg = Message(
        conversation_id=conversation_id,
        role="user",
        content=request.question,
    )
    db.add(user_msg)

    assistant_msg = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=answer,
        citations=json.dumps(sources) if sources else None,
    )
    db.add(assistant_msg)

    if len(conversation.messages) <= 1:
        conversation.title = request.question[:80]
        if len(request.question) > 80:
            conversation.title += "..."

    conversation.preview = request.question[:120]
    conversation.updated_at = datetime.utcnow()
    db.commit()

    # ==========================================================
    # Response
    # ==========================================================

    response = {
        "question": request.question,
        "answer": answer,
        "sources": sources,
        "conversation_id": conversation_id,
    }

    rerank_scores = results.get("rerank_scores")
    if rerank_scores:
        response["rerank_scores"] = rerank_scores

    return response
