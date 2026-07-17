from pydantic import BaseModel


class QuestionRequest(BaseModel):
    question: str
    conversation_id: int | None = None