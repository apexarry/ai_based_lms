from sqlalchemy.orm import Session

from app.services.embedding_service import EmbeddingService
from app.services.chroma_service import ChromaService
from app.services.query_service import QueryService


class RetrievalService:

    OVERVIEW_CHUNKS = 4
    MAX_DISTANCE = 1.40

    def __init__(self):

        self.embedding_service = EmbeddingService()
        self.chroma_service = ChromaService()
        self.query_service = QueryService()

    def retrieve(
        self,
        question: str,
        db: Session,
        n_results: int = 10,
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
        # OVERVIEW RETRIEVAL
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

        # ==========================================================
        # SEMANTIC RETRIEVAL
        # ==========================================================

        else:

            question_embedding = self.embedding_service.generate_embedding(
                question,
            )

            if document:

                print(f"\nSemantic search inside '{document.title}'")

                results = self.chroma_service.search(
                    embedding=question_embedding,
                    n_results=n_results,
                    where={
                        "document_id": document.id,
                    },
                )

            else:

                print("\nSemantic search across entire library")

                results = self.chroma_service.search(
                    embedding=question_embedding,
                    n_results=n_results,
                )

        # Nearest-vector search always returns something. Avoid sending clearly
        # unrelated context to the LLM, where it becomes a plausible hallucination.
        distances = results.get("distances", [[]])[0]
        if distances and min(distances) > self.MAX_DISTANCE:
            results = {"documents": [[]], "metadatas": [[]], "distances": [[]]}

        # ==========================================================
        # SAFETY CHECK
        # ==========================================================

        if (
            not results["documents"]
            or not results["documents"][0]
        ):

            print("\nNo chunks retrieved.")

            return {
                "query": query,
                "results": results,
            }

        # ==========================================================
        # DEBUG OUTPUT
        # ==========================================================

        print("\n" + "=" * 80)
        print("RETRIEVED CHUNKS")
        print("=" * 80)

        for i, chunk in enumerate(results["documents"][0]):

            print(f"\nChunk {i + 1}")
            print("-" * 40)
            print(chunk[:800])

        print("\n" + "=" * 80)
        print("METADATA")
        print("=" * 80)

        for meta in results["metadatas"][0]:
            print(meta)

        print("\n" + "=" * 80)
        print(f"Retrieved {len(results['documents'][0])} chunks.")
        print("=" * 80)

        # ==========================================================
        # RETURN
        # ==========================================================

        return {
            "query": query,
            "results": results,
        }
