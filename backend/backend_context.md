# Gemini Chat Backend Context

This document provides a comprehensive overview of the backend architecture, API endpoints, and data structures to assist in frontend development.

## 🚀 General Information
- **Base URL:** `http://localhost:8000`
- **API Prefix:** `/api/v1`
- **Auth Strategy:** JWT (Bearer Token)
- **Real-time:** Server-Sent Events (SSE) for chat streaming

---

## 🔐 Authentication
Protected routes require the header: `Authorization: Bearer <access_token>`

### Endpoints
| Method | Endpoint | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Create a new user account | `UserCreate` | `UserResponse` |
| `POST` | `/auth/login` | Authenticate and get token | `UserLogin` | `Token` |
| `GET` | `/users/me` | Get current user profile | None | `UserResponse` |

---

## 💬 Chat & Conversations

### Conversation Management
| Method | Endpoint | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/chat/conversations` | Create a new chat | `ConversationCreate` | `ConversationResponse` |
| `GET` | `/chat/conversations` | List user's chats | None | `List[ConversationResponse]` |
| `GET` | `/chat/conversations/{id}` | Get chat details | None | `ConversationResponse` |
| `PATCH` | `/chat/conversations/{id}` | Rename chat | `ConversationUpdate` | `ConversationResponse` |
| `DELETE` | `/chat/conversations/{id}` | Delete a chat | None | `204 No Content` |

### Messages & Streaming
| Method | Endpoint | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/chat/conversations/{id}/messages` | Get message history | None | `List[MessageResponse]` |
| `POST` | `/chat/conversations/{id}/messages` | Send message (Streaming) | `ChatRequest` | `SSE Stream` |

#### 📡 SSE Streaming Protocol
The `POST /chat/conversations/{id}/messages` endpoint returns a `text/event-stream`.
The frontend should listen for `message` events where the `data` is a JSON string:

1. **Chunk:** `{"chunk": "part of the text..."}` - Append this to the UI.
2. **Completion:** `{"done": true}` - The response is finished.
3. **Error:** `{"error": "message"}` - Something went wrong.

---

## 📦 Data Structures (Schemas)

### User
```typescript
interface UserResponse {
  id: number;
  email: string;
  created_at: string; // ISO Date
}

interface UserCreate {
  email: string;
  password: str;
}

interface UserLogin {
  email: string;
  password: str;
}

interface Token {
  access_token: string;
  token_type: "bearer";
}
```

### Conversation
```typescript
interface ConversationResponse {
  id: number;
  title: string;
  user_id: number;
  created_at: string; // ISO Date
}

interface ConversationCreate {
  title: string;
}

interface ConversationUpdate {
  title?: string;
}
```

### Message
```typescript
type MessageRole = "user" | "assistant";

interface MessageResponse {
  id: number;
  conversation_id: number;
  content: string;
  role: MessageRole;
  created_at: string; // ISO Date
}

interface ChatRequest {
  message: string;
}
```

---

## 🛠 Development Notes
- **CORS:** Allowed for `http://localhost:3000` by default.
- **Error Handling:** Standard FastAPI/Pydantic validation errors (422) and HTTPExceptions (401, 404, etc.).
- **SSE Client-side:** Use `fetch` with a library like `fetch-event-source` or a custom reader to handle POST requests with streaming, as native `EventSource` only supports GET.
