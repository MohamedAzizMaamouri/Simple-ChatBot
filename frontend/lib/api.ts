import axios, { AxiosError, AxiosInstance } from 'axios';
import { AuthResponse, LoginRequest, RegisterRequest, User, Conversation, ConversationCreate, Message } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - Add token to requests
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('access_token');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<User> {
    const response = await this.client.post<User>('/auth/register', data);
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', data);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/users/me');
    return response.data;
  }

  // Conversation endpoints
  async getConversations(): Promise<Conversation[]> {
    const response = await this.client.get<Conversation[]>('/chat/conversations');
    return response.data;
  }

  async createConversation(data: ConversationCreate): Promise<Conversation> {
    const response = await this.client.post<Conversation>('/chat/conversations', data);
    return response.data;
  }
  async updateConversation(id: number, data: Partial<ConversationCreate>): Promise<Conversation> {
    const response = await this.client.patch<Conversation>(`/chat/conversations/${id}`, data);
    return response.data;
  }

  async getConversation(id: number): Promise<Conversation> {
    const response = await this.client.get<Conversation>(`/chat/conversations/${id}`);
    return response.data;
  }

  async deleteConversation(id: number): Promise<void> {
    await this.client.delete(`/chat/conversations/${id}`);
  }

  // Message endpoints
  async getMessages(conversationId: number): Promise<Message[]> {
    const response = await this.client.get<Message[]>(`/chat/conversations/${conversationId}/messages`);
    return response.data;
  }

  // Streaming endpoint (handled separately in components)
  getStreamingURL(conversationId: number): string {
    const token = localStorage.getItem('access_token');
    return `${API_BASE_URL}/chat/conversations/${conversationId}/messages`;
  }
}

export const apiClient = new APIClient();