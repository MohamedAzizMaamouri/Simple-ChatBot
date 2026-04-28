'use client';

import {useState} from 'react';
import {useAuth} from '@/lib/auth';
import {useConversations} from '@/hooks/useConversations';
import {useChat} from '@/hooks/useChat';
import {Sidebar} from '@/components/chat/Sidebar';
import {ChatWindow} from '@/components/chat/ChatWindow';
import {MessageInput} from '@/components/chat/MessageInput';
import {useRouter} from 'next/navigation';
import {apiClient} from "@/lib/api";

export default function ChatPage() {
    const {logout} = useAuth();
    const router = useRouter();
    const [activeConversationId, setActiveConversationId] = useState<number | null>(null);

    const {
        conversations,
        loading: conversationsLoading,
        createConversation,
        deleteConversation,
    } = useConversations();

    const {
        messages,
        loading: messagesLoading,
        streaming,
        streamingContent,
        sendMessage,
    } = useChat(activeConversationId);

    const handleNewConversation = async () => {
        const newConv = await createConversation('New Conversation');
        if (newConv) {
            setActiveConversationId(newConv.id);
        }
    };

    const handleDeleteConversation = async (id: number) => {
        if (activeConversationId === id) {
            setActiveConversationId(null);
        }
        await deleteConversation(id);
    };

    const handleSendMessage = async (content: string) => {
        // If this is the first message, update conversation title
        if (messages.length === 0 && activeConversationId) {
            const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
            await apiClient.updateConversation(activeConversationId, {title: title});
        }

        await sendMessage(content);
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="h-screen flex overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={setActiveConversationId}
                onNewConversation={handleNewConversation}
                onDeleteConversation={handleDeleteConversation}
                onLogout={handleLogout}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                <ChatWindow
                    messages={messages}
                    loading={messagesLoading}
                    streaming={streaming}
                    streamingContent={streamingContent}
                    conversationId={activeConversationId}
                />

                {activeConversationId && (
                    <MessageInput onSend={handleSendMessage} disabled={streaming}/>
                )}
            </div>
        </div>
    );
}