import chromadb


class ChromaService:

    def __init__(self):
        self.client = chromadb.PersistentClient(path="chroma_db")

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

        self.collection.add(
            ids=[f"{document_id}_{chunk_id}"],
            embeddings=[embedding],
            documents=[text],
            metadatas=[
                {
                    "document_id": document_id,
                    "chunk_id": chunk_id,
                    "title": title,
                    "author": author,
                    "category": category,
                    "department": department,
                    "publication_year": publication_year,
                }
            ],
        )

    def search(self, embedding, n_results=5):

        return self.collection.query(
            query_embeddings=[embedding],
            n_results=n_results,
        )