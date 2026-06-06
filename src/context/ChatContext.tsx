import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { getChatHistory, sendChatMessage} from '../services/aiService';
import { useAuth } from './AuthContext';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
}

interface ChatContextType {
    isChatOpen: boolean;
    toggleChat: () => void;
    messages: Message[];
    sendMessage: (text: string, context?: any) => Promise<void>;
    loading: boolean;
    sessionId: string | null;
    setChatOpen: (value: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error("useChat must be used within ChatProvider");
    return context;
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('chatSessionId'));

    useEffect(() => {
        if (isAuthenticated && sessionId && isChatOpen) {
            // Load history only when opened to save bandwidth
            loadHistory();
        }
    }, [isChatOpen, isAuthenticated]);

    const loadHistory = async () => {
        if (!sessionId) return;
        try {
            const res = await getChatHistory(sessionId);
            setMessages(res.data);
        } catch (error) {
            console.error("Failed to load chat history", error);
        }
    };

    const sendMessage = async (text: string, context?: any) => {
        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setLoading(true);

        try {
            const res = await sendChatMessage(text, sessionId || undefined, context);
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);

            if (!sessionId) {
                setSessionId(res.data.sessionId);
                localStorage.setItem('chatSessionId', res.data.sessionId);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    const toggleChat = () => setIsChatOpen(prev => !prev);
    const setChatOpen = (value: boolean) => setIsChatOpen(value);

    return (
        <ChatContext.Provider value={{ isChatOpen, toggleChat, messages, sendMessage, loading, sessionId, setChatOpen }}>
            {children}
        </ChatContext.Provider>
    );
};