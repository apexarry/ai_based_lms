from sqlalchemy.orm import Session

from app.services.embedding_service import EmbeddingService
from app.services.chroma_service import ChromaService
from app.services.query_service import QueryService
from app.services.reranking_service import RerankingService


class RetrievalService:

    OVERVIEW_CHUNKS = 4
    N_FETCH = 20
    TOP_K = 10
    MAX_DISTANCE = 1.40

    def __init__(self):

        self.embedding_service = EmbeddingService()
        self.chroma_service = ChromaService()
        self.query_service = QueryService()
        self.reranking_service = RerankingService()

    def retrieve(
        self,
        question: str,
        db: Session,
    ):

        print("\n" + "=" * 80)
        print("RETRIEVAL PIPELINE")
        print("=" * 80)

        # ==========================================================
        # Understand the user's query
        # ==========================================================

        query = self.query_service.understand_query(
            question=question,
            db=db,
        )

        strategy = query["retrieval_strategy"]
        document = query["document"]

        # ==========================================================
        # OVERVIEW RETRIEVAL (no reranking needed)
        # ==========================================================

        if strategy == "intro_first" and document:

            print("\nOverview request detected.")
            print(f"Selected document: {document.title}")

            chunks = self.chroma_service.get_document_chunks(
                document.id,
            )

            chunks = chunks[:self.OVERVIEW_CHUNKS]

            documents = [chunk[0] for chunk in chunks]
            metadata = [chunk[1] for chunk in chunks]

            results = {
                "documents": [documents],
                "metadatas": [metadata],
            }

            print(f"Retrieved {len(documents)} overview chunks.")

            return {
                "query": query,
                "results": results,
            }

        # ==========================================================
        # SEMANTIC RETRIEVAL + RERANKING
        # ==========================================================

        question_embedding = self.embedding_service.generate_embedding(
            question,
        )

        if document:
            print(f"\nSemantic search inside '{document.title}'")
            raw_results = self.chroma_service.search(
                embedding=question_embedding,
                n_results=self.N_FETCH,
                where={"document_id": document.id},
            )
        else:
            print("\nSemantic search across entire library")
            raw_results = self.chroma_service.search(
                embedding=question_embedding,
                n_results=self.N_FETCH,
            )

        raw_docs = raw_results.get("documents", [[]])[0] or []
        raw_meta = raw_results.get("metadatas", [[]])[0] or []
        raw_dist = raw_results.get("distances", [[]])[0] or []

        # ---------------------------------------------------------------
        # Hard distance cutoff — discard chunks that are clearly unrelated
        # ---------------------------------------------------------------

        filtered = [
            (i, doc, meta, dist)
            for i, (doc, meta, dist) in enumerate(zip(raw_docs, raw_meta, raw_dist))
            if dist <= self.MAX_DISTANCE
        ]

        if not filtered:
            print("\nNo chunks within distance threshold.")
            return {
                "query": query,
                "results": {"documents": [[]], "metadatas": [[]], "distances": [[]]},
            }

        filtered_docs = [item[1] for item in filtered]
        filtered_meta = [item[2] for item in filtered]

        # ---------------------------------------------------------------
        # Cross-encoder reranking
        # ---------------------------------------------------------------

        print(f"\nReranking {len(filtered_docs)} candidates...")
        indices, scores = self.reranking_service.rerank(
            query=question,
            documents=filtered_docs,
            top_k=self.TOP_K,
        )

        reranked_docs = [filtered_docs[i] for i in indices]
        reranked_meta = [filtered_meta[i] for i in indices]

        print(f"Top {len(reranked_docs)} after reranking.")

        results = {
            "documents": [reranked_docs],
            "metadatas": [reranked_meta],
            "rerank_scores": scores,
        }

        # ==========================================================
        # DEBUG OUTPUT
        # ==========================================================

        print("\n" + "=" * 80)
        print("RERANKED CHUNKS")
        print("=" * 80)

        for i, chunk in enumerate(reranked_docs):
            print(f"\nChunk {i + 1}  (score: {scores[i]:.4f})")
            print("-" * 40)
            print(chunk[:800])

        print("\n" + "=" * 80)
        print("METADATA")
        print("=" * 80)

        for meta in reranked_meta:
            print(meta)

        print("\n" + "=" * 80)
        print(f"Returning {len(reranked_docs)} chunks.")
        print("=" * 80)

        # ==========================================================
        # RETURN
        # ==========================================================

        return {
            "query": query,
            "results": results,
        }
