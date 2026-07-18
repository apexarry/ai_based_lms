from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: int
    title: str
    author: str | None = None
    department: str | None = None

    # Frontend-friendly names
    year: int | None = None
    type: str | None = None

    fileName: str
    fileSize: str

    # Placeholder values until AI pipeline is implemented
    pages: int = 0
    keywords: list[str] = []
    bookmarked: bool = False

    owner_id: int | None = None

    ocr_status: str = "text"

    ocr_page_current: int | None = None

    ocr_page_total: int | None = None

    class Config:
        from_attributes = True