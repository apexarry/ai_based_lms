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

    def add_chunks(
        self, document_id, chunks, embeddings, title, author,
        category, department, publication_year,
        chunk_ids=None, sections=None, page_starts=None, page_ends=None,
    ):
        """Store all chunks together with metadata Chroma accepts (never None)."""
        chunk_ids = chunk_ids or list(range(len(chunks)))
        sections = sections or [None] * len(chunks)
        page_starts = page_starts or [None] * len(chunks)
        page_ends = page_ends or [None] * len(chunks)

        base = {
            "document_id": document_id,
            "title": title or "Untitled document",
            "author": author or "Unknown",
            "category": category or "Uncategorised",
            "department": department or "Unknown",
            "publication_year": publication_year or 0,
        }

        metadatas = []
        for i, chunk_id in enumerate(chunk_ids):
            meta = {**base, "chunk_id": chunk_id}
            if sections[i]:
                meta["section"] = sections[i]
            if page_starts[i] is not None:
                meta["page_start"] = page_starts[i]
            if page_ends[i] is not None:
                meta["page_end"] = page_ends[i]
            metadatas.append(meta)

        self.collection.add(
            ids=[f"{document_id}_{chunk_id}" for chunk_id in chunk_ids],
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas,
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
        include_embeddings: bool = False,
    ):
        include = ["documents", "metadatas"]
        if include_embeddings:
            include.append("embeddings")

        results = self.collection.get(
            where={
                "document_id": document_id,
            },
            include=include,
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

        if include_embeddings:
            embeddings = results.get("embeddings", [])
            return combined, embeddings

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
