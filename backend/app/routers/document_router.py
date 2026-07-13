from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db


router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)

@router.get("/")
def get_documents(db: Session = Depends(get_db)):
    return {
        "message": "Documents endpoint working"
        }