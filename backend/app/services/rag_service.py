import re

from app.services.chroma_service import ChromaService
from app.services.embedding_service import EmbeddingService

PAGE_MARKER = re.compile(r"--- PAGE (\d+) ---")

SECTION_HEADINGS = re.compile(
    r"(?im)^(?:#+\s+)?"
    r"(?:\d+(?:\.\d+)*\.?\s+)?"
    r"(?:"
    r"abstract|introduction|background|related\s*work"
    r"|methodology|method|approach|proposed\s+(?:method|approach|framework|system|model|architecture)"
    r"|experiments?|experimental\s+(?:setup|results?|evaluation|study)"
    r"|results?|findings|outcomes"
    r"|discussion|analysis|evaluation"
    r"|conclusion|conclusions|summary|future\s*work"
    r"|references|bibliography|works\s*cited"
    r"|acknowledgments?|appendix|appendices"
    r"|data\s*availability|declarations|supplementary\s*material"
    r"|limitations|threats?\s*to\s*validity"
    r"|motivation|overview|preliminaries|formulation"
    r"|implementation|deployment|results?\s*and\s*discussion"
    r")\s*$"
)

ALL_CAPS_HEADING = re.compile(r"^[A-Z][A-Z\s]{2,}$")

STANDALONE_PAGE_NUM = re.compile(r"^\d+\s*$", re.MULTILINE)
DOI_LINE = re.compile(r"^DOI:\s*10\.\S+", re.MULTILINE | re.IGNORECASE)
COPYRIGHT_LINE = re.compile(
    r"^\s*[©©]\s*\d{4}\s+.*$|^\s*all\s+rights\s+reserved\.?\s*$",
    re.MULTILINE | re.IGNORECASE,
)
PUBLISHER_FOOTER = re.compile(
    r"^\d{4}\s+(?:IEEE|ACM|Springer|Elsevier|Taylor\s*&\s*Francis|SAGE|Wiley).*$",
    re.MULTILINE | re.IGNORECASE,
)
ARXIV_ID = re.compile(r"^arXiv:\d{4}\.\d+", re.MULTILINE)


class RAGService:
    """Prepare extracted document text for reliable semantic retrieval."""

    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.chroma = ChromaService()

    def clean_text(self, text: str) -> str:
        text = (text or "").replace("\r", "\n")

        text = re.sub(STANDALONE_PAGE_NUM, "", text)
        text = re.sub(DOI_LINE, "", text)
        text = re.sub(COPYRIGHT_LINE, "", text)
        text = re.sub(PUBLISHER_FOOTER, "", text)
        text = re.sub(ARXIV_ID, "", text)

        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n{3,}", "\n\n", text)

        reference_heading = re.search(
            r"(?im)^\s*(?:\d+(?:\.\d+)*\.?\s+)?(?:references|bibliography|works cited)\s*$",
            text,
        )
        if reference_heading:
            text = text[:reference_heading.start()]

        return text.strip()

    def _parse_pages(self, text: str) -> list[tuple[int, str]]:
        """Split text by page markers. Returns [(page_num, text), ...].

        Falls back to a single page 0 entry if no markers found.
        """
        parts = PAGE_MARKER.split(text)
        if len(parts) < 2:
            return [(0, text)]

        pages = []
        for i in range(1, len(parts), 2):
            page_num = int(parts[i])
            page_text = parts[i + 1].strip()
            if page_text:
                pages.append((page_num, page_text))

        return pages

    def _detect_sections(self, text: str) -> list[tuple[str, int, int]]:
        """Split text into sections.

        Returns [(section_name, char_start, char_end), ...].
        """
        lines = text.split("\n")
        sections = []
        current_section = "Introduction"
        current_start = 0
        char_offset = 0

        for line in lines:
            stripped = line.strip()
            if not stripped:
                char_offset += len(line) + 1
                continue

            is_heading = bool(
                SECTION_HEADINGS.match(stripped)
                or ALL_CAPS_HEADING.match(stripped)
            )

            if is_heading and len(stripped.split()) <= 8:
                sections.append((current_section, current_start, char_offset))
                current_section = stripped
                current_start = char_offset + len(line) + 1

            char_offset += len(line) + 1

        sections.append((current_section, current_start, char_offset))
        return sections

    def chunk_text(
        self,
        text: str,
        chunk_size: int = 300,
        overlap: int = 50,
    ) -> list[dict]:
        """Section-aware chunking with page tracking.

        Returns list of dicts:
            { "text": str, "section": str, "page_start": int, "page_end": int }
        """
        pages = self._parse_pages(text)
        chunks = []

        for page_num, page_text in pages:
            sections = self._detect_sections(page_text)

            for section_name, sec_start, sec_end in sections:
                section_text = page_text[sec_start:sec_end].strip()
                if not section_text:
                    continue

                section_words = len(section_text.split())

                if section_words <= chunk_size:
                    chunks.append({
                        "text": section_text,
                        "section": section_name,
                        "page_start": page_num,
                        "page_end": page_num,
                    })
                else:
                    sentences = re.split(r"(?<=[.!?])\s+", section_text)
                    current = []
                    current_words = 0
                    sub_start_page = page_num

                    for sentence in sentences:
                        sentence = sentence.strip()
                        if not sentence:
                            continue
                        sw = len(sentence.split())
                        if current and current_words + sw > chunk_size:
                            chunks.append({
                                "text": " ".join(current),
                                "section": section_name,
                                "page_start": sub_start_page,
                                "page_end": page_num,
                            })
                            trailing = " ".join(current).split()[-overlap:]
                            current = [" ".join(trailing)] if trailing else []
                            current_words = len(trailing)
                            sub_start_page = page_num
                        current.append(sentence)
                        current_words += sw

                    if current:
                        chunks.append({
                            "text": " ".join(current),
                            "section": section_name,
                            "page_start": sub_start_page,
                            "page_end": page_num,
                        })

        return chunks

    def index_document(self, document):
        cleaned = self.clean_text(document.extracted_text)
        chunk_data = self.chunk_text(cleaned)
        if not chunk_data:
            return

        chunks = [c["text"] for c in chunk_data]
        sections = [c["section"] for c in chunk_data]
        page_starts = [c["page_start"] for c in chunk_data]
        page_ends = [c["page_end"] for c in chunk_data]

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
            sections=sections,
            page_starts=page_starts,
            page_ends=page_ends,
        )
        document.embedding_completed = True
