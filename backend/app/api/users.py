from fastapi import APIRouter, Depends
from app.schemas.user import UserResponse
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current authenticated user info (protected route)."""
    return current_user