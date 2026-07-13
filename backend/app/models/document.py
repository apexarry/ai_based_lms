from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Boolean,
    DateTime,
)
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)

    author = Column(String(255))

    department = Column(String(100))

    category = Column(String(100))

    publication_year = Column(Integer)

    file_name = Column(String(255))

    file_path = Column(String(500))

    file_size = Column(Integer)

    mime_type = Column(String(100))

    is_scanned = Column(Boolean, default=False)

    ocr_completed = Column(Boolean, default=False)

    embedding_completed = Column(Boolean, default=False)

    owner_id = Column(Integer, ForeignKey("users.id"))

    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="documents")