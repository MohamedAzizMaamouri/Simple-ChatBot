'use client';

import { Conversation } from '@/types';
import { motion } from 'framer-motion';
import { Trash2, Plus, MessageSquare } from 'lucide-react';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: number) => void;
  onLogout: () => void;
}

export function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onLogout,
}: SidebarProps) {
  return (
    <div className="w-64 bg-dark-900 border-r border-dark-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-dark-700">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 bg-primary text-dark font-semibold py-3 rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus size={20} />
          New Chat
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageSquare size={48} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="group relative"
              >
                <button
                  onClick={() => onSelectConversation(conv.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                    activeConversationId === conv.id
                      ? 'bg-dark-800 text-primary'
                      : 'hover:bg-dark-800 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    <span className="truncate text-sm flex-1">{conv.title}</span>
                  </div>
                </button>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded transition-all"
                >
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-dark-700">
        <button
          onClick={onLogout}
          className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}