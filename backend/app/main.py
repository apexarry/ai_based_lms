from app.database.database import Base, engine
import app.models

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database.database import engine
from app.routers.document_router import router as document_router
from app.routers.dashboard_router import router as dashboard_router
from app.routers.assistant_router import router as assistant_router
from app.routers.recommendations_router import router as recommendations_router
from app.routers.conversations_router import router as conversations_router
from app.routers.auth_router import router as auth_router
from app.routers.admin_router import router as admin_router

Base.metadata.create_all(bind=engine)

# Apply schema migrations for existing tables
with engine.connect() as conn:
    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()"))
    conn.execute(text("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER'"))
    conn.execute(text("UPDATE users SET role = 'USER' WHERE role NOT IN ('USER', 'ADMIN')"))
    conn.execute(text("ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)"))
    conn.execute(text("ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS uq_bookmark_document"))
    conn.execute(text("ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS uq_bookmark_document_user"))
    conn.execute(text("ALTER TABLE bookmarks ADD CONSTRAINT uq_bookmark_document_user UNIQUE (document_id, user_id)"))
    conn.execute(text("ALTER TABLE conversations ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)"))
    conn.execute(text("ALTER TABLE document_views DROP CONSTRAINT IF EXISTS document_views_document_id_fkey"))
    conn.execute(text("ALTER TABLE document_views ADD CONSTRAINT document_views_document_id_fkey FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE"))
    conn.commit()

app = FastAPI(
    title="DESIDOC AI Knowledge Library",
    version="1.0.0",
)

app.include_router(document_router)
app.include_router(dashboard_router)
app.include_router(assistant_router)
app.include_router(recommendations_router)
app.include_router(conversations_router)
app.include_router(auth_router)
app.include_router(admin_router)

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