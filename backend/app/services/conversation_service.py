from sqlalchemy.orm import Session
from typing import List
from fastapi import HTTPException, status
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.message_repository import MessageRepository
from app.schemas.conversation import ConversationCreate, ConversationUpdate
from app.models.conversation import Conversation
from app.models.message import Message, MessageRole


class ConversationService:
    """Handles conversation and message business logic."""

    def __init__(self, db: Session):
        self.db = db
        self.conversation_repo = ConversationRepository(db)
        self.message_repo = MessageRepository(db)

    def create_conversation(self, user_id: int, conversation_data: ConversationCreate) -> Conversation:
        """Create a new conversation."""
        return self.conversation_repo.create(user_id, conversation_data)

    def get_user_conversations(self, user_id: int) -> List[Conversation]:
        """Get all conversations for a user."""
        return self.conversation_repo.get_user_conversations(user_id)

    def get_conversation(self, conversation_id: int, user_id: int) -> Conversation:
        """Get a specific conversation (with ownership check)."""
        conversation = self.conversation_repo.get_by_id(conversation_id)

        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )

        # Check ownership
        if conversation.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this conversation"
            )

        return conversation

    def update_conversation(
            self,
            conversation_id: int,
            user_id: int,
            update_data: ConversationUpdate
    ) -> Conversation:
        """Update a conversation."""
        conversation = self.get_conversation(conversation_id, user_id)

        updated = self.conversation_repo.update(conversation_id, update_data)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update conversation"
            )

        return updated

    def delete_conversation(self, conversation_id: int, user_id: int) -> bool:
        """Delete a conversation."""
        # Check ownership first
        self.get_conversation(conversation_id, user_id)

        return self.conversation_repo.delete(conversation_id)

    def get_conversation_messages(self, conversation_id: int, user_id: int) -> List[Message]:
        """Get all messages in a conversation."""
        # Verify ownership
        self.get_conversation(conversation_id, user_id)

        return self.message_repo.get_conversation_messages(conversation_id)

    def add_user_message(self, conversation_id: int, user_id: int, content: str) -> Message:
        """Add a user message to a conversation."""
        # Verify ownership
        self.get_conversation(conversation_id, user_id)

        return self.message_repo.create(conversation_id, MessageRole.USER, content)

    def add_assistant_message(self, conversation_id: int, content: str) -> Message:
        """Add an assistant message to a conversation."""
        return self.message_repo.create(conversation_id, MessageRole.ASSISTANT, content)

    def is_first_message(self, conversation_id: int) -> bool:
        """Check if a conversation has only one message (the first user message)."""
        messages = self.message_repo.get_conversation_messages(conversation_id)
        return len(messages) == 1

    def update_title_from_first_message(self, conversation_id: int, user_id: int, llm_service) -> str:
        """
        Generate and update conversation title based on the first message.
        Returns the generated title.
        """
        # Get the conversation
        conversation = self.get_conversation(conversation_id, user_id)
        
        # Get the first user message
        messages = self.message_repo.get_conversation_messages(conversation_id)
        first_message = next((msg for msg in messages if msg.role == MessageRole.USER), None)
        
        if not first_message:
            return conversation.title
        
        # Generate title using LLM
        generated_title = llm_service.generate_conversation_title(first_message.content)
        
        # Update the conversation with the generated title
        update_data = ConversationUpdate(title=generated_title)
        self.update_conversation(conversation_id, user_id, update_data)
        
        return generated_title


