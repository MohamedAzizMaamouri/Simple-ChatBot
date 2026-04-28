'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/types';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { MessageSquare } from 'lucide-react';

interface ChatWindowProps {
  messages: Message[];
  loading: boolean;
  streaming: boolean;
  streamingContent: string;
  conversationId: number | null;
}

export function ChatWindow({
  messages,
  loading,
  streaming,
  streamingContent,
  conversationId,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark">
        <div className="text-center">
          <MessageSquare size={64} className="mx-auto mb-4 text-primary/30" />
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to AI Chat</h2>
          <p className="text-gray-400">Select a conversation or create a new one to start chatting</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-dark px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.length === 0 && !streaming ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {streaming && <TypingIndicator content={streamingContent} />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}