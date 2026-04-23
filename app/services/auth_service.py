from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserLogin
from app.models.user import User
from app.core.security import verify_password, create_access_token


class AuthService:
    """Handles authentication business logic."""

    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def register(self, user_data: UserCreate) -> User:
        """Register a new user."""
        # Check if user already exists
        if self.user_repo.exists(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create user
        user = self.user_repo.create(user_data)
        return user

    def login(self, credentials: UserLogin) -> str:
        """Authenticate user and return JWT token."""
        # Get user
        user = self.user_repo.get_by_email(credentials.email)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )

        # Verify password
        if not verify_password(credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )

        # Create access token
        access_token = create_access_token(data={"sub": user.email})

        return access_token

    def get_current_user(self, email: str) -> Optional[User]:
        """Get user by email (used in auth dependency)."""
        return self.user_repo.get_by_email(email)