from app.services.embedding_service import EmbeddingService
from app.services.chroma_service import ChromaService


class RAGService:

    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.chroma = ChromaService()

    def clean_text(self, text: str):

        stop_sections = [
            "references",
            "bibliography",
            "works cited",
            "appendix",
        ]

        lower_text = text.lower()

        for section in stop_sections:

            index = lower_text.find(section)

            if index != -1:
                return text[:index]

        return text

    def chunk_text(
        self,
        text: str,
        chunk_size: int = 500,
        overlap: int = 75,
    ):
        """
        Split text into overlapping chunks.
        """

        words = text.split()

        chunks = []

        step = chunk_size - overlap

        for i in range(0, len(words), step):

            chunk = " ".join(words[i:i + chunk_size])

            if chunk.strip():
                chunks.append(chunk)

        return chunks

    def index_document(self, document):

        cleaned_text = self.clean_text(document.extracted_text)

        chunks = self.chunk_text(cleaned_text)

        print("=" * 60)
        print(f"Created {len(chunks)} chunks")
        print("=" * 60)

        for i, chunk in enumerate(chunks):

            print(f"Embedding chunk {i + 1}/{len(chunks)}")

            embedding = self.embedding_service.generate_embedding(chunk)

            self.chroma.add_document(
                document_id=document.id,
                chunk_id=i,
                text=chunk,
                embedding=embedding,
                title=document.title,
                author=document.author,
                category=document.category,
                department=document.department,
                publication_year=document.publication_year,
            )

        print("=" * 60)
        print("Document indexed successfully!")
        print("=" * 60)