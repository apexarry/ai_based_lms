from pydantic import BaseModel
from datetime import datetime


class DocumentResponse(BaseModel):
    id: int
    title: str
    author: str | None = None
    department: str | None = None
    category: str | None = None
    publication_year: int | None = None
    file_name: str
    file_path: str

    class Config:
        from_attributes = True