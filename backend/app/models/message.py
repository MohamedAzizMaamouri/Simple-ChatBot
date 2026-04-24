from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.database import Base


class MessageRole(str, enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    role = Column(Enum(MessageRole), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")

    def __repr__(self):
        return f"<Message {self.role}: {self.content[:30]}...>"