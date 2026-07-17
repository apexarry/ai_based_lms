import numpy as np
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.document import Document
from app.services.embedding_service import EmbeddingService
from app.services.chroma_service import ChromaService

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"],
)

embedding_service = EmbeddingService()
chroma_service = ChromaService()


def _document_to_dict(doc):
    return {
        "id": doc.id,
        "title": doc.title,
        "author": doc.author,
        "department": doc.department,
        "type": doc.category,
        "year": doc.publication_year,
    }


@router.get("/")
def get_global_recommendations(
    limit: int = 6,
    db: Session = Depends(get_db),
):
    """Return a mix of recent documents and semantically similar clusters."""
    documents = db.query(Document).filter(
        Document.embedding_completed == True,  # noqa: E712
    ).all()

    if len(documents) <= limit:
        return [_document_to_dict(d) for d in documents]

    recs = {}
    seen_ids = set()

    for doc in documents:
        if doc.id in seen_ids:
            continue
        seen_ids.add(doc.id)
        recs[doc.id] = _document_to_dict(doc)
        if len(recs) >= limit:
            break

    return list(recs.values())[:limit]


@router.get("/{document_id}")
def get_document_recommendations(
    document_id: int,
    limit: int = 6,
    db: Session = Depends(get_db),
):
    """Find documents similar to a given document via embedding similarity."""
    source = db.query(Document).filter(Document.id == document_id).first()
    if not source:
        return {"error": "Document not found"}, 404

    chunks, embeddings = chroma_service.get_document_chunks(
        document_id,
        include_embeddings=True,
    )

    if not chunks or not embeddings:
        return {"error": "Document has no embeddings"}, 404

    doc_embedding = np.mean(embeddings, axis=0).tolist()

    raw_results = chroma_service.search(
        embedding=doc_embedding,
        n_results=limit + 5,
        where={
            "document_id": {"$ne": document_id},
        },
    )

    raw_docs = raw_results.get("documents", [[]])[0] or []
    raw_meta = raw_results.get("metadatas", [[]])[0] or []

    seen = {}
    for meta in raw_meta:
        doc_id = meta["document_id"]
        if doc_id not in seen and doc_id != document_id:
            seen[doc_id] = {
                "id": doc_id,
                "title": meta.get("title", "Untitled"),
                "author": meta.get("author", "Unknown"),
                "department": meta.get("department", ""),
                "type": meta.get("category", ""),
                "year": meta.get("publication_year", 0),
                "relevance": 1.0,
            }

    result = list(seen.values())[:limit]

    for item in result:
        db_doc = db.query(Document).filter(Document.id == item["id"]).first()
        if db_doc:
            item["summary"] = (
                db_doc.extracted_text[:300].strip()
                if db_doc.extracted_text
                else ""
            )

    return result
