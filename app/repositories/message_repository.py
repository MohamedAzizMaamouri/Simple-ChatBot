from sqlalchemy.orm import Session
from typing import List
from app.models.message import Message, MessageRole
from app.schemas.message import MessageCreate


class MessageRepository:
    """Handles database operations for messages."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, conversation_id: int, role: MessageRole, content: str) -> Message:
        """Create a new message."""
        db_message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content
        )
        self.db.add(db_message)
        self.db.commit()
        self.db.refresh(db_message)
        return db_message

    def get_conversation_messages(self, conversation_id: int) -> List[Message]:
        """Get all messages for a conversation."""
        return self.db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at.asc()).all()