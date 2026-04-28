'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { Message } from '@/types';

export function useChat(conversationId: number | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    } else {
      setMessages([]);
      setLoading(false);
    }
  }, [conversationId]);

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      const data = await apiClient.getMessages(conversationId);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId || !content.trim()) return;

    // Add user message optimistically
    const userMessage: Message = {
      id: Date.now(), // Temporary ID
      conversation_id: conversationId,
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setStreaming(true);
    setStreamingContent('');

    try {
      const token = localStorage.getItem('access_token');
      const url = apiClient.getStreamingURL(conversationId);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: content.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));

              if (data.chunk) {
                fullResponse += data.chunk;
                setStreamingContent(fullResponse);
              }

              if (data.done) {
                // Add assistant message
                const assistantMessage: Message = {
                  id: Date.now() + 1,
                  conversation_id: conversationId,
                  role: 'assistant',
                  content: fullResponse,
                  created_at: new Date().toISOString(),
                };

                setMessages((prev) => [...prev, assistantMessage]);
                setStreaming(false);
                setStreamingContent('');
              }

              if (data.error) {
                console.error('Streaming error:', data.error);
                setStreaming(false);
                setStreamingContent('');
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setStreaming(false);
      setStreamingContent('');
    }
  }, [conversationId]);

  return {
    messages,
    loading,
    streaming,
    streamingContent,
    sendMessage,
    refetch: fetchMessages,
  };
}