from app.database.database import Base, engine
import app.models

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database.database import engine
from app.routers.document_router import router as document_router
from app.routers.dashboard_router import router as dashboard_router
from app.routers.assistant_router import router as assistant_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DESIDOC AI Knowledge Library",
    version="1.0.0",
)

app.include_router(document_router)
app.include_router(dashboard_router)
app.include_router(assistant_router)

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "success",
            "database": "Connected",
            "message": "DESIDOC AI Backend Running"
        }

    except Exception as e:
        return {
            "status": "failed",
            "database": "Not Connected",
            "error": str(e)
        }