from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.schemas.assistant import QuestionRequest

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
):

    # ==========================================================
    # Retrieve documents + query understanding
    # ==========================================================

    retrieval = retrieval_service.retrieve(
        question=request.question,
        db=db,
    )

    query = retrieval["query"]
    results = retrieval["results"]

    # ==========================================================
    # No documents found
    # ==========================================================

    if (
        not results["documents"]
        or not results["documents"][0]
    ):
        return {
            "question": request.question,
            "answer": "I couldn't find any relevant documents.",
            "sources": [],
        }

    documents = results["documents"][0]
    metadata = results["metadatas"][0]

    context = "\n\n".join(
        f"[Source: {item.get('title', 'Untitled document')} | "
        f"Chunk {item.get('chunk_id', 0) + 1}]\n{chunk}"
        for chunk, item in zip(documents, metadata)
    )

    # ==========================================================
    # Build prompt
    # ==========================================================

    prompt = prompt_builder.build_prompt(
        question=request.question,
        context=context,
        intent=query["intent"],
        document=query["document"],
    )

    # ==========================================================
    # Generate answer
    # ==========================================================

    answer = llm.answer_question(
        prompt=prompt,
    )

    # ==========================================================
    # Prepare sources
    # ==========================================================

    sources = []
    seen = set()

    for item in metadata:

        source_key = (
            item["title"],
            item["author"],
        )

        if source_key in seen:
            continue

        seen.add(source_key)

        sources.append(
            {
                "title": item["title"],
                "author": item["author"],
                "category": item["category"],
                "department": item["department"],
                "publication_year": item["publication_year"],
            }
        )

    # ==========================================================
    # Response
    # ==========================================================

    return {
        "question": request.question,
        "answer": answer,
        "sources": sources,
    }
