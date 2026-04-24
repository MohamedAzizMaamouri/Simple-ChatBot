from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.conversation import Conversation
from app.schemas.conversation import ConversationCreate, ConversationUpdate


class ConversationRepository:
    """Handles database operations for conversations."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, conversation_data: ConversationCreate) -> Conversation:
        """Create a new conversation."""
        db_conversation = Conversation(
            user_id=user_id,
            title=conversation_data.title
        )
        self.db.add(db_conversation)
        self.db.commit()
        self.db.refresh(db_conversation)
        return db_conversation

    def get_by_id(self, conversation_id: int) -> Optional[Conversation]:
        """Get conversation by ID."""
        return self.db.query(Conversation).filter(Conversation.id == conversation_id).first()

    def get_user_conversations(self, user_id: int) -> List[Conversation]:
        """Get all conversations for a user."""
        return self.db.query(Conversation).filter(
            Conversation.user_id == user_id
        ).order_by(Conversation.created_at.desc()).all()

    def update(self, conversation_id: int, update_data: ConversationUpdate) -> Optional[Conversation]:
        """Update conversation."""
        conversation = self.get_by_id(conversation_id)
        if not conversation:
            return None

        if update_data.title is not None:
            conversation.title = update_data.title

        self.db.commit()
        self.db.refresh(conversation)
        return conversation

    def delete(self, conversation_id: int) -> bool:
        """Delete conversation."""
        conversation = self.get_by_id(conversation_id)
        if not conversation:
            return False

        self.db.delete(conversation)
        self.db.commit()
        return True