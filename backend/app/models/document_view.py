from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.database.database import Base


class DocumentView(Base):
    __tablename__ = "document_views"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    viewed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    document = relationship("Document")
