# Gemini Chat Backend - Project Overview

A robust FastAPI backend for an AI Chat application powered by Google Gemini, featuring streaming responses, persistent conversation history, and user authentication.

## Technologies
- **Framework:** FastAPI (0.109.0)
- **AI Model:** Google Generative AI (Gemini 2.5 Flash)
- **Database:** SQLAlchemy 2.0 with MySQL (pymysql)
- **Authentication:** JWT (python-jose) & bcrypt (passlib)
- **Validation:** Pydantic v2
- **Real-time:** Server-Sent Events (SSE) via `sse-starlette`

## Architecture
The project follows a **Layered Architecture** with a clear separation of concerns:

- `app/api/`: REST endpoints, routers, and dependency injection (`deps.py`).
- `app/services/`: Core business logic, including `LLMService` for Gemini integration and `ConversationService`.
- `app/repositories/`: Data access layer abstracting SQLAlchemy queries.
- `app/models/`: SQLAlchemy database models (User, Conversation, Message).
- `app/schemas/`: Pydantic models for request/response validation and serialization.
- `app/db/`: Database configuration and session management.
- `app/core/`: Global settings (Pydantic Settings) and security utilities.

## Building and Running

### Prerequisites
- Python 3.10+
- MySQL Server

### Installation
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Create a `.env` file in the root directory based on the following variables:
   ```env
   MYSQL_USER=your_user
   MYSQL_PASSWORD=your_password
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_DATABASE=gemini_chat
   SECRET_KEY=your_jwt_secret_key
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

### Running the Application
Start the development server with uvicorn:
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`.
Documentation (Swagger UI) is available at `http://localhost:8000/docs`.

### Testing
- Run individual tests or scripts: `python test.py`
- TODO: Implement a comprehensive test suite using `pytest`.

## Development Conventions
- **Pydantic for Everything:** Use Pydantic for configuration, request bodies, and response models.
- **Repository Pattern:** All database interactions should go through a repository class in `app/repositories/`.
- **Streaming Responses:** Chat responses are streamed using `LLMService.generate_streaming_response` and delivered via SSE in `app/api/chat.py`.
- **Dependency Injection:** Use FastAPI's `Depends` for database sessions and user authentication.
- **Migration Strategy:** The application currently uses `Base.metadata.create_all()` in `app/main.py`. For production, consider integrating Alembic.
