import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { ChatMessage } from '@/types/chatmessage'
import { QimenReport } from '@/types/qimen'

export interface Conversation {
  id: string
  title: string
  qimenReport?: QimenReport
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

interface ConversationState {
  conversations: Conversation[]
  currentConversationId: string | null
  createConversation: (title?: string, qimenReport?: QimenReport) => string
  deleteConversation: (id: string) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  setCurrentConversation: (id: string) => void
  getCurrentConversation: () => Conversation | null
  addMessageToConversation: (conversationId: string, message: ChatMessage) => void
  updateMessageInConversation: (conversationId: string, messageId: string, content: string) => void
  generateConversationTitle: (conversationId: string) => void
  clearAllConversations: () => void
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,

      createConversation: (title = '新对话', qimenReport?: QimenReport) => {
        const id = nanoid()
        const now = Date.now()
        
        // 如果有奇门遁甲报告，使用报告信息生成标题
        const conversationTitle = qimenReport 
          ? `${qimenReport.result.basicInfo.gongli} - ${qimenReport.input.questionType}`
          : title
        
        const conversation: Conversation = {
          id,
          title: conversationTitle,
          qimenReport,
          messages: [],
          createdAt: now,
          updatedAt: now
        }
        
        set((state: ConversationState) => ({
          conversations: [conversation, ...state.conversations],
          currentConversationId: id
        }))
        
        return id
      },

      deleteConversation: (id: string) => {
        set((state: ConversationState) => {
          const newConversations = state.conversations.filter((c: Conversation) => c.id !== id)
          const newCurrentId = state.currentConversationId === id
            ? (newConversations[0]?.id || null)
            : state.currentConversationId
            
          return {
            conversations: newConversations,
            currentConversationId: newCurrentId
          }
        })
      },

      updateConversation: (id: string, updates: Partial<Conversation>) => {
        set((state: ConversationState) => ({
          conversations: state.conversations.map((c: Conversation) =>
            c.id === id
              ? { ...c, ...updates, updatedAt: Date.now() }
              : c
          )
        }))
      },

      setCurrentConversation: (id: string) => {
        const conversation = get().conversations.find((c: Conversation) => c.id === id)
        if (conversation) {
          set({ currentConversationId: id })
          
          // 同步更新奇门报告状态
          const { useQimenStore } = require('@/store/useQimenStore')
          const { setCurrentReport } = useQimenStore.getState()
          setCurrentReport(conversation.qimenReport || null)
          
          // 清空全局聊天消息，使用对话级别的消息
          const { useChatStore } = require('@/store/useChatStore')
          const { clearMessages } = useChatStore.getState()
          clearMessages()
        }
      },

      getCurrentConversation: () => {
        const { conversations, currentConversationId } = get()
        return conversations.find((c: Conversation) => c.id === currentConversationId) || null
      },

      addMessageToConversation: (conversationId: string, message: ChatMessage) => {
        set((state: ConversationState) => ({
          conversations: state.conversations.map((c: Conversation) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, message],
                  updatedAt: Date.now()
                }
              : c
          )
        }))
      },

      updateMessageInConversation: (conversationId: string, messageId: string, content: string) => {
        set((state: ConversationState) => ({
          conversations: state.conversations.map((c: Conversation) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m: ChatMessage) =>
                    m.id === messageId
                      ? { ...m, content: m.content + content }
                      : m
                  ),
                  updatedAt: Date.now()
                }
              : c
          )
        }))
      },

      generateConversationTitle: (conversationId: string) => {
        const conversation = get().conversations.find((c: Conversation) => c.id === conversationId)
        if (!conversation || conversation.messages.length === 0) return
        
        // 基于第一条用户消息生成标题
        const firstUserMessage = conversation.messages.find((m: ChatMessage) => m.role === 'user')
        if (firstUserMessage) {
          const title = firstUserMessage.content.slice(0, 20) + 
            (firstUserMessage.content.length > 20 ? '...' : '')
          
          get().updateConversation(conversationId, { title })
        }
      },

      clearAllConversations: () => {
        set({
          conversations: [],
          currentConversationId: null
        })
      }
    }),
    {
      name: 'conversation-storage',
      // 只持久化对话数据，不包括当前选中的对话ID
      partialize: (state: ConversationState) => ({
        conversations: state.conversations
      }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // 从版本0迁移到版本1的逻辑
          return {
            ...persistedState,
            currentConversationId: null
          }
        }
        return persistedState
      },
      // 页面刷新后重置当前对话ID
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.currentConversationId = null
        }
      }
    }
  )
)

// 选择器函数
export const selectConversations = (state: ConversationState) => state.conversations
export const selectCurrentConversationId = (state: ConversationState) => state.currentConversationId
export const selectCurrentConversation = (state: ConversationState) => {
  if (!state.currentConversationId) return null
  return state.conversations.find(c => c.id === state.currentConversationId) || null
}

export const useCurrentConversation = () => {
  const { getCurrentConversation } = useConversationStore()
  return getCurrentConversation()
}

export const useConversationList = () => {
  return useConversationStore((state: ConversationState) => 
    state.conversations.sort((a: Conversation, b: Conversation) => b.updatedAt - a.updatedAt)
  )
}

export const useCurrentConversationId = () => {
  return useConversationStore((state: ConversationState) => state.currentConversationId)
}

// 工具函数
export const getConversationSummary = (conversation: Conversation) => {
  return {
    id: conversation.id,
    title: conversation.title,
    messageCount: conversation.messages.length,
    lastMessage: conversation.messages[conversation.messages.length - 1],
    hasQimenReport: !!conversation.qimenReport,
    updatedAt: conversation.updatedAt
  }
}

export const formatConversationTime = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    const minutes = Math.floor(diff / minute)
    return `${minutes}分钟前`
  } else if (diff < day) {
    const hours = Math.floor(diff / hour)
    return `${hours}小时前`
  } else if (diff < week) {
    const days = Math.floor(diff / day)
    return `${days}天前`
  } else {
    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
}