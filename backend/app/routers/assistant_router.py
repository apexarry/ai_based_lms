from fastapi import APIRouter

from app.schemas.assistant import QuestionRequest
from app.services.embedding_service import EmbeddingService
from app.services.chroma_service import ChromaService
from app.services.llm_service import LLMService

router = APIRouter(
    prefix="/assistant",
    tags=["Assistant"],
)

embedding_service = EmbeddingService()
chroma = ChromaService()
llm = LLMService()


@router.post("/ask")
def ask_question(request: QuestionRequest):

    question_embedding = embedding_service.generate_embedding(
        request.question
    )

    results = chroma.search(
        question_embedding,
        n_results=5,
    )

    documents = results["documents"][0]
    metadata = results["metadatas"][0]

    context = "\n\n".join(documents)

    answer = llm.answer_question(
        request.question,
        context,
    )

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

    return {
        "question": request.question,
        "answer": answer,
        "sources": sources,
    }