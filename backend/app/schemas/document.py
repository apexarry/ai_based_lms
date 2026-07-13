from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: int
    title: str
    author: str | None = None
    category: str | None = None

    class Config:
        from_attributes = True