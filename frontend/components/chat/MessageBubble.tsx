'use client';

import { Message } from '@/types';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Bot size={18} className="text-dark" />
        </div>
      )}

      <div
        className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
          isUser
            ? 'bg-primary text-dark rounded-br-sm'
            : 'bg-dark-800 text-white rounded-bl-sm'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-dark-800 flex items-center justify-center flex-shrink-0">
          <User size={18} className="text-primary" />
        </div>
      )}
    </motion.div>
  );
}