from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.auth import UserResponse
from app.dependencies.auth import get_current_admin

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.get("/users", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return db.query(User).order_by(User.id).all()


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}


@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    body: dict,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    new_role = body.get("role")
    if new_role not in ("USER", "ADMIN"):
        raise HTTPException(status_code=400, detail="Role must be USER or ADMIN")

    if user_id == admin.id and new_role != "ADMIN":
        raise HTTPException(status_code=400, detail="Cannot demote yourself")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = new_role
    db.commit()
    return {"message": f"User {user_id} role updated to {new_role}"}
