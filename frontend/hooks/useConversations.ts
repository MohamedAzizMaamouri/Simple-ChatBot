'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Conversation, ConversationCreate } from '@/types';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getConversations();
      setConversations(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (title: string): Promise<Conversation | null> => {
    try {
      const newConv = await apiClient.createConversation({ title });
      setConversations([newConv, ...conversations]);
      return newConv;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create conversation');
      return null;
    }
  };

  const deleteConversation = async (id: number) => {
    try {
      await apiClient.deleteConversation(id);
      setConversations(conversations.filter((c) => c.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete conversation');
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return {
    conversations,
    loading,
    error,
    createConversation,
    deleteConversation,
    refetch: fetchConversations,
  };
}