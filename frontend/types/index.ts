// User types
export interface User {
  id: number;
  email: string;
  created_at: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// Conversation types
export interface Conversation {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
}

export interface ConversationCreate {
  title: string;
}

// Message types
export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatRequest {
  message: string;
}

// API Error
export interface APIError {
  detail: string;
}