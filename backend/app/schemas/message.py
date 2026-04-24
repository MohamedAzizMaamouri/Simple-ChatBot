from pydantic import BaseModel
from datetime import datetime
from typing import Literal
from app.models.message import MessageRole


class MessageBase(BaseModel):
    content: str


class MessageCreate(MessageBase):
    pass


class MessageResponse(MessageBase):
    id: int
    conversation_id: int
    role: MessageRole
    created_at: datetime

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    message: str