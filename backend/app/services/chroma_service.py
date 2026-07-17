import chromadb


class ChromaService:

    def __init__(self):

        self.client = chromadb.PersistentClient(
            path="chroma_db"
        )

        self.collection = self.client.get_or_create_collection(
            name="documents"
        )

    def add_document(
        self,
        document_id: int,
        chunk_id: int,
        text: str,
        embedding: list,
        title: str,
        author: str,
        category: str,
        department: str,
        publication_year: int,
    ):

        self.add_chunks(
            document_id, [text], [embedding], title, author, category,
            department, publication_year, [chunk_id],
        )

    def add_chunks(self, document_id, chunks, embeddings, title, author,
                   category, department, publication_year, chunk_ids=None):
        """Store all chunks together with metadata Chroma accepts (never None)."""
        chunk_ids = chunk_ids or list(range(len(chunks)))
        metadata = {
            "document_id": document_id,
            "title": title or "Untitled document",
            "author": author or "Unknown",
            "category": category or "Uncategorised",
            "department": department or "Unknown",
            "publication_year": publication_year or 0,
        }
        self.collection.add(
            ids=[f"{document_id}_{chunk_id}" for chunk_id in chunk_ids],
            embeddings=embeddings,
            documents=chunks,
            metadatas=[{**metadata, "chunk_id": chunk_id} for chunk_id in chunk_ids],
        )

    def search(
        self,
        embedding,
        n_results=5,
        where=None,
    ):

        query = {
            "query_embeddings": [embedding],
            "n_results": n_results,
            "include": ["documents", "metadatas", "distances"],
        }

        if where is not None:
            query["where"] = where

        return self.collection.query(**query)

    def get_document_chunks(
        self,
        document_id: int,
    ):
        """
        Fetch ALL chunks for a document.
        """

        results = self.collection.get(
            where={
                "document_id": document_id,
            },
            include=[
                "documents",
                "metadatas",
            ],
        )

        combined = list(
            zip(
                results["documents"],
                results["metadatas"],
            )
        )

        combined.sort(
            key=lambda x: x[1]["chunk_id"]
        )

        return combined
    def delete_document(
        self,
        document_id: int,
    ):

        self.collection.delete(
            where={
                "document_id": document_id,
            }
        )
