from sqlalchemy.orm import Session
from typing import Optional
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash


class UserRepository:
    """Handles database operations for users."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        return self.db.query(User).filter(User.email == email).first()

    def get_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return self.db.query(User).filter(User.id == user_id).first()

    def create(self, user_data: UserCreate) -> User:
        """Create a new user."""
        hashed_password = get_password_hash(user_data.password)

        db_user = User(
            email=user_data.email,
            hashed_password=hashed_password
        )

        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)

        return db_user

    def exists(self, email: str) -> bool:
        """Check if user exists."""
        return self.db.query(User).filter(User.email == email).first() is not None