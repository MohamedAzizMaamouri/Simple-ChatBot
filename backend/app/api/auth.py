from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.schemas.token import Token
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(
        user_data: UserCreate,
        db: Session = Depends(get_db)
):
    """Register a new user."""
    auth_service = AuthService(db)
    user = auth_service.register(user_data)
    return user


@router.post("/login", response_model=Token)
def login(
        credentials: UserLogin,
        db: Session = Depends(get_db)
):
    """Login and get access token."""
    auth_service = AuthService(db)
    access_token = auth_service.login(credentials)

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }