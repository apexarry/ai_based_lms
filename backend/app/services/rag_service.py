import re

from app.services.chroma_service import ChromaService
from app.services.embedding_service import EmbeddingService


class RAGService:
    """Prepare extracted document text for reliable semantic retrieval."""

    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.chroma = ChromaService()

    def clean_text(self, text: str) -> str:
        text = (text or "").replace("\r", "\n")
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n{3,}", "\n\n", text)

        # Remove only a real bibliography heading.  Removing every occurrence
        # of "references" cut valid body text from many papers.
        reference_heading = re.search(
            r"(?im)^\s*(?:\d+(?:\.\d+)*\.?\s+)?(?:references|bibliography|works cited)\s*$",
            text,
        )
        if reference_heading:
            text = text[:reference_heading.start()]
        return text.strip()

    def chunk_text(self, text: str, chunk_size: int = 300, overlap: int = 50) -> list[str]:
        """Chunk on sentence boundaries, retaining short overlap for context."""
        sentences = re.split(r"(?<=[.!?])\s+", text.strip())
        chunks: list[str] = []
        current: list[str] = []
        current_words = 0

        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
            sentence_words = sentence.split()
            if current and current_words + len(sentence_words) > chunk_size:
                chunks.append(" ".join(current))
                trailing = " ".join(current).split()[-overlap:]
                current = [" ".join(trailing)] if trailing else []
                current_words = len(trailing)
            current.append(sentence)
            current_words += len(sentence_words)

        if current:
            chunks.append(" ".join(current))
        return chunks

    def index_document(self, document):
        chunks = self.chunk_text(self.clean_text(document.extracted_text))
        if not chunks:
            return

        # Replacing the document makes indexing retries idempotent.
        self.chroma.delete_document(document.id)
        embeddings = self.embedding_service.generate_embeddings(chunks)
        self.chroma.add_chunks(
            document_id=document.id,
            chunks=chunks,
            embeddings=embeddings,
            title=document.title,
            author=document.author,
            category=document.category,
            department=document.department,
            publication_year=document.publication_year,
        )
        document.embedding_completed = True
