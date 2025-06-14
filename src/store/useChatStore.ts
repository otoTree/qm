import { create } from 'zustand';
import { persist } from 'zustand/middleware'; 
import { nanoid } from 'nanoid';
import { ChatState, MessageRole, ChatMessage } from '@/types/chatmessage'

// 创建store（使用新语法）
export const useChatStore = create<ChatState>()(
    persist(
        (set) => ({
            messages: [],

            // 添加新消息（添加参数类型）
            addMessage: (role: MessageRole, content: string) =>
                set((state: ChatState) => ({
                    messages: [
                        ...state.messages,
                        {
                            id: nanoid(),
                            role,
                            content,
                            timestamp: Date.now()
                        }
                    ]
                })),

            // 更新消息内容（添加参数类型）
            updateMessage: (id: string, newContent: string) =>
                set((state: ChatState) => ({
                    messages: state.messages.map((msg: ChatMessage) =>
                        msg.id === id
                            ? { ...msg, content: msg.content + newContent }
                            : msg
                    )
                })),

            // 清空对话
            clearMessages: () => set({ messages: [] }),
        }),
        {
            name: 'chat-storage',
            partialize: (state: ChatState) => ({ messages: state.messages }),
        }
    )
);