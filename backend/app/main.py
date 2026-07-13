from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database.database import engine

app = FastAPI(
    title="DESIDOC AI Knowledge Library",
    version="1.0.0",
)

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