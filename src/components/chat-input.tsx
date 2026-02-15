'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Sparkles } from 'lucide-react'
import { QimenInput } from '@/types/qimen'
import { useQimenStore } from '@/store/useQimenStore'
import { useConversationStore } from '@/store/useConversationStore'
import { useChatStore } from '@/store/useChatStore'
import { useUserStore, PersonProfile } from '@/store/useUserStore'
import { AIService } from '@/lib/ai-service'
import { MessageRole } from '@/types/chatmessage'
import { nanoid } from 'nanoid'
import { cn } from '@/lib/utils'

import { Clock } from 'lucide-react'

interface ChatInputProps {
  onQimenGenerated?: (reportId: string) => void
  onMessageSent?: (messageId: string) => void
  className?: string
}

export function ChatInput({ onQimenGenerated, onMessageSent, className }: ChatInputProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  
  // Mention state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionIndex, setMentionIndex] = useState(0)
  const [cursorPosition, setCursorPosition] = useState(0)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Store hooks
  const { generateReport } = useQimenStore()
  const { 
    createConversation, 
    getCurrentConversation, 
    addMessageToConversation,
    updateMessageInConversation,
    setCurrentConversation,
    currentConversationId 
  } = useConversationStore()
  const { addMessage, updateMessage } = useChatStore()
  const { profile, savedProfiles } = useUserStore()
  
  // Filtered profiles for mention
  const timeProfile: PersonProfile = {
    id: 'current-time',
    name: '时盘',
    gender: 'male', // placeholder
    birthDate: new Date(), // placeholder
    birthChart: null
  }

  const allProfiles = [timeProfile, ...savedProfiles]
  
  const filteredProfiles = mentionQuery !== null 
    ? allProfiles.filter(p => p.name.toLowerCase().includes(mentionQuery.toLowerCase()))
    : []

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [chatMessage])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setChatMessage(newValue)
    
    const selectionStart = e.target.selectionStart
    const textBeforeCursor = newValue.slice(0, selectionStart)
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@')
    
    if (lastAtSymbol !== -1) {
      const query = textBeforeCursor.slice(lastAtSymbol + 1)
      // Check if query contains space (end of mention)
      if (!query.includes(' ') && !query.includes('\n')) {
        setMentionQuery(query)
        setCursorPosition(lastAtSymbol)
        setMentionIndex(0)
        return
      }
    }
    setMentionQuery(null)
  }

  const handleSelectProfile = (selectedProfile: PersonProfile) => {
    if (mentionQuery === null) return
    
    const before = chatMessage.slice(0, cursorPosition)
    const after = chatMessage.slice(cursorPosition + mentionQuery.length + 1)
    const newValue = `${before}@${selectedProfile.name} ${after}`
    
    setChatMessage(newValue)
    setMentionQuery(null)
    
    // Focus back to textarea
    if (textareaRef.current) {
        textareaRef.current.focus()
    }
  }

  const handleChatSubmit = async () => {
    if (!chatMessage.trim()) return
    
    const messageToSend = chatMessage.trim()
    setChatMessage('')
    
    setIsLoading(true)
    
    // Extract mentions
    const mentionedNames = messageToSend.match(/@(\S+)/g)?.map(s => s.slice(1)) || []
    const contextCharts = savedProfiles.filter(p => mentionedNames.includes(p.name))
    const hasTimeChartMention = mentionedNames.includes('时盘')
    
    try {
      let currentConv = getCurrentConversation()
      let conversationId = currentConv?.id || currentConversationId

      // 1. 自动排盘逻辑
      // 默认情况：如果没有当前对话或当前对话没有排盘，会自动起时盘
      // 修改后：
      // - 如果有 @时盘 -> 强制起时盘
      // - 如果没有 @时盘 但有其他 @人物 -> 跳过起时盘 (合盘/命盘分析模式)
      // - 如果都没有：
      //   - 如果没有当前对话 -> 起时盘
      //   - 如果有当前对话且是新对话（空消息）且无排盘 -> 起时盘
      //   - 如果有当前对话且已有消息 -> 不起盘（追问）
      
      const isNewEmptyConversation = !currentConv || (currentConv.messages.length === 0 && !currentConv.qimenReport)
      
      const shouldGenerateTimeChart = hasTimeChartMention || (mentionedNames.length === 0 && isNewEmptyConversation)

      if (shouldGenerateTimeChart) {
        const now = new Date()
        const input: QimenInput = {
            datetime: now,
            questionType: 'general', // 默认为综合运势
            gender: 'male', // 默认性别，后续可优化为用户设置
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate(),
            hours: now.getHours(),
            minute: now.getMinutes(),
            ju_model: 0,
            pan_model: 1,
            zhen: 2
        }

        await generateReport(input)
        const { currentReport } = useQimenStore.getState()

        if (currentReport) {
            // 创建带排盘的新对话
            conversationId = createConversation(undefined, currentReport)
            setCurrentConversation(conversationId)
            
            // 添加排盘结果消息
            const reportMsg = {
                id: nanoid(),
                role: 'assistant' as MessageRole,
                content: '',
                timestamp: Date.now(),
                type: 'report' as const,
                reportId: currentReport.id
            }
            
            if (conversationId) {
                addMessageToConversation(conversationId, reportMsg)
            }
            addMessage(reportMsg.role, reportMsg.content, 'report', reportMsg.reportId)
            
            onQimenGenerated?.(currentReport.id)
            
            // 更新 currentConv 引用
            currentConv = useConversationStore.getState().getCurrentConversation()
        }
      } else if (!currentConv) {
        // 如果不需要起局且没有当前对话，创建一个空对话（纯聊天/合盘分析模式）
        const title = mentionedNames.length > 0 ? `与 ${mentionedNames.join('、')} 的对话` : '新对话'
        conversationId = createConversation(title)
        setCurrentConversation(conversationId)
        currentConv = useConversationStore.getState().getCurrentConversation()
      }
    
      // 2. 添加用户消息
      const userMessage = {
        id: nanoid(),
        role: 'user' as MessageRole,
        content: messageToSend,
        timestamp: Date.now()
      }
      
      // 确保 conversationId 是最新的
      conversationId = useConversationStore.getState().currentConversationId
      
      if (conversationId) {
        addMessageToConversation(conversationId, userMessage)
      }
      
      addMessage(userMessage.role, userMessage.content)
      onMessageSent?.(userMessage.id)
      
      // 3. 调用 AI (流式)
      const conversation = useConversationStore.getState().getCurrentConversation()
      const history = conversation?.messages || []
      
      // 创建一个空的 AI 消息占位符
      const aiMessageId = nanoid()
      const aiMessage = {
        id: aiMessageId,
        role: 'assistant' as MessageRole,
        content: '', // 初始内容为空
        timestamp: Date.now()
      }

      // 添加空消息到 UI
      if (conversationId) {
        addMessageToConversation(conversationId, aiMessage)
      }
      addMessage(aiMessage.role, aiMessage.content)

      // 开始流式请求
      await AIService.sendMessageStream(
        messageToSend,
        history,
        conversation?.qimenReport,
        profile.birthChart,
        (chunk: string) => {
            // 实时更新消息内容
            if (conversationId) {
                updateMessageInConversation(conversationId, aiMessageId, chunk)
            }
            updateMessage(aiMessageId, chunk)
        },
        (fullContent: string) => {
            // 完成时 (可以在这里做一些清理工作，如果需要)
        },
        (error: Error) => {
            // 错误处理
            console.error('AI Stream Error:', error)
            const errorMsg = '\n\n[出错了，请稍后再试]'
            if (conversationId) {
                updateMessageInConversation(conversationId, aiMessageId, errorMsg)
            }
            updateMessage(aiMessageId, errorMsg)
        },
        contextCharts
      )
      
    } catch (error) {
      console.error('Failed to process message:', error)
      
      const errorMessage = {
        id: nanoid(),
        role: 'assistant' as MessageRole,
        content: '抱歉，我现在无法回复您的消息。请稍后再试。',
        timestamp: Date.now()
      }
      
      const conversationId = useConversationStore.getState().currentConversationId
      if (conversationId) {
        addMessageToConversation(conversationId, errorMessage)
      }
      addMessage(errorMessage.role, errorMessage.content)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (mentionQuery !== null && filteredProfiles.length > 0) {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setMentionIndex(prev => (prev - 1 + filteredProfiles.length) % filteredProfiles.length)
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setMentionIndex(prev => (prev + 1) % filteredProfiles.length)
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSelectProfile(filteredProfiles[mentionIndex])
        return
      }
      if (e.key === 'Escape') {
        setMentionQuery(null)
        return
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleChatSubmit()
    }
  }
  
  return (
    <div className={`relative group ${className}`}>
      {/* Mention Popup */}
      {mentionQuery !== null && filteredProfiles.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-popover text-popover-foreground rounded-md border shadow-md z-50 overflow-hidden">
          <div className="p-1">
            {filteredProfiles.map((p, index) => (
              <div
                key={p.id}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer",
                  index === mentionIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                )}
                onClick={() => handleSelectProfile(p)}
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px]">
                  {p.id === 'current-time' ? <Clock className="h-3 w-3" /> : p.name[0]}
                </div>
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div 
        className={`
          relative flex flex-col transition-all duration-300
          ${isFocused ? 'scale-[1.01]' : 'scale-100'}
        `}
      >
        <div className="relative">
            <Textarea
              ref={textareaRef}
              value={chatMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="问卦..."
              className={`
                min-h-[60px] max-h-[200px] pr-12 resize-none 
                bg-transparent border-none
                rounded-none shadow-none focus-visible:ring-0 px-0 py-4
                text-base font-serif tracking-wide text-foreground/90 placeholder:text-muted-foreground/40
                transition-all duration-300
              `}
              disabled={isLoading}
            />
            
            {/* 渐变底线 */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] w-full">
               <div 
                 className={`
                   absolute inset-0 bg-gradient-to-r from-transparent via-foreground/20 to-transparent
                   transition-opacity duration-500
                   ${isFocused ? 'opacity-100' : 'opacity-60'}
                 `} 
               />
               <div 
                 className={`
                   absolute inset-0 bg-gradient-to-r from-transparent via-foreground/60 to-transparent
                   transition-all duration-700 ease-in-out
                   ${isFocused ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-50'}
                 `} 
               />
            </div>
            
            <div className="absolute right-0 bottom-4 flex items-center gap-2">
                <Button 
                  size="icon"
                  variant="ghost"
                  className={`
                    h-8 w-8 rounded-full transition-all duration-300
                    ${chatMessage.trim() ? 'opacity-100 rotate-0 bg-foreground text-background hover:bg-foreground/90' : 'opacity-0 rotate-90 pointer-events-none'}
                  `}
                  onClick={handleChatSubmit}
                  disabled={!chatMessage.trim() || isLoading}
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </Button>
            </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
           <span className="text-[10px] text-muted-foreground/30 font-serif">
             {isLoading ? '正在推演...' : '按 Enter 发送'}
           </span>
           {isLoading && <Sparkles className="w-3 h-3 text-muted-foreground/30 animate-pulse" />}
        </div>
      </div>
    </div>
  )
}
