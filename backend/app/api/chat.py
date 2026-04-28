from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.conversation import ConversationCreate, ConversationResponse, ConversationUpdate
from app.schemas.message import MessageResponse, ChatRequest
from app.services.conversation_service import ConversationService
from app.services.llm_service import LLMService
from app.models.message import MessageRole
import json

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/conversations", response_model=ConversationResponse, status_code=201)
def create_conversation(
        conversation_data: ConversationCreate,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Create a new conversation."""
    service = ConversationService(db)
    conversation = service.create_conversation(current_user.id, conversation_data)
    return conversation


@router.get("/conversations", response_model=List[ConversationResponse])
def get_conversations(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Get all conversations for the current user."""
    service = ConversationService(db)
    conversations = service.get_user_conversations(current_user.id)
    return conversations


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation(
        conversation_id: int,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Get a specific conversation."""
    service = ConversationService(db)
    conversation = service.get_conversation(conversation_id, current_user.id)
    return conversation


@router.patch("/conversations/{conversation_id}", response_model=ConversationResponse)
def update_conversation(
        conversation_id: int,
        update_data: ConversationUpdate,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Update a conversation (e.g., change title)."""
    service = ConversationService(db)
    conversation = service.update_conversation(conversation_id, current_user.id, update_data)
    return conversation


@router.delete("/conversations/{conversation_id}", status_code=204)
def delete_conversation(
        conversation_id: int,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Delete a conversation."""
    service = ConversationService(db)
    service.delete_conversation(conversation_id, current_user.id)
    return None


@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
def get_messages(
        conversation_id: int,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Get all messages in a conversation."""
    service = ConversationService(db)
    messages = service.get_conversation_messages(conversation_id, current_user.id)
    return messages


@router.post("/conversations/{conversation_id}/messages")
async def send_message(
        conversation_id: int,
        chat_request: ChatRequest,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """
    Send a message and get streaming AI response.
    Uses Server-Sent Events (SSE) for real-time streaming.
    """
    service = ConversationService(db)
    llm_service = LLMService()

    # Verify conversation ownership
    service.get_conversation(conversation_id, current_user.id)

    # Save user message
    service.add_user_message(conversation_id, current_user.id, chat_request.message)

    # If this is the first message, generate a title for the conversation
    if service.is_first_message(conversation_id):
        try:
            service.update_title_from_first_message(conversation_id, current_user.id, llm_service)
        except Exception as e:
            # If title generation fails, continue anyway (don't break the chat)
            print(f"Failed to generate conversation title: {e}")

    # Get conversation history
    messages = service.get_conversation_messages(conversation_id, current_user.id)

    # Stream AI response
    async def event_generator():
        """Generate Server-Sent Events for streaming."""
        full_response = ""

        try:
            async for chunk in llm_service.generate_streaming_response(messages, chat_request.message):
                full_response += chunk

                # Send chunk as SSE
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"

            # Save complete assistant message to database
            service.add_assistant_message(conversation_id, full_response)

            # Send completion event
            yield f"data: {json.dumps({'done': True})}\n\n"

        except Exception as e:
            # Send error event
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )