import google.generativeai as genai
from typing import List, AsyncGenerator
from app.core.config import settings
from app.models.message import Message

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)


class LLMService:
    """Handles AI model interactions with streaming support."""

    def __init__(self):
        self.model = genai.GenerativeModel("gemini-2.5-flash")

    def _format_conversation_history(self, messages: List[Message]) -> List[dict]:
        """
        Convert database messages to Gemini format.
        Gemini expects: [{"role": "user", "parts": ["text"]}, ...]
        """
        formatted = []
        for msg in messages:
            # Map our roles to Gemini roles
            role = "user" if msg.role == "user" else "model"
            formatted.append({
                "role": role,
                "parts": [msg.content]
            })
        return formatted

    async def generate_streaming_response(
            self,
            conversation_history: List[Message],
            new_message: str
    ) -> AsyncGenerator[str, None]:
        """
        Generate streaming response from Gemini.
        Yields chunks of text as they arrive.
        """
        # Format conversation history
        history = self._format_conversation_history(conversation_history)

        # Add new user message
        history.append({
            "role": "user",
            "parts": [new_message]
        })

        # Create chat session with history
        chat = self.model.start_chat(history=history[:-1])  # History without the new message

        # Send message and stream response
        response = chat.send_message(new_message, stream=True)

        for chunk in response:
            if chunk.text:
                yield chunk.text