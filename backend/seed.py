"""Seed the first admin user.

Usage:
    python seed.py

This script creates the initial ADMIN user (admin@desidoc.gov.in)
if one does not already exist.
"""

from sqlalchemy import text

from app.database.database import SessionLocal, engine
from app.models.user import User
from app.core.security import hash_password


def seed_admin():
    # Ensure schema is up to date
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()"))
        conn.execute(text("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER'"))
        conn.execute(text("UPDATE users SET role = 'USER' WHERE role NOT IN ('USER', 'ADMIN')"))
        conn.execute(text("ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)"))
        conn.execute(text("ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS uq_bookmark_document"))
        conn.execute(text("ALTER TABLE bookmarks ADD CONSTRAINT uq_bookmark_document_user UNIQUE (document_id, user_id)"))
        conn.commit()

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == "admin@desidoc.gov.in").first()
        if existing:
            print(f"Admin user already exists (id={existing.id}, role={existing.role})")
            return

        admin = User(
            name="Admin",
            email="admin@desidoc.gov.in",
            password_hash=hash_password("admin123"),
            role="ADMIN",
        )
        db.add(admin)
        db.commit()
        print("Admin user created: admin@desidoc.gov.in / admin123")
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
