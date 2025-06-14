'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Calendar, Clock, Send, Sparkles, User, MessageSquare } from 'lucide-react'
import { QimenInput, QuestionType } from '@/types/qimen'
import { useQimenStore } from '@/store/useQimenStore'
import { useConversationStore } from '@/store/useConversationStore'
import { useChatStore } from '@/store/useChatStore'
import { AIService } from '@/lib/ai-service'
import { MessageRole } from '@/types/chatmessage'
import { nanoid } from 'nanoid'

interface ChatInputProps {
  onQimenGenerated?: (reportId: string) => void
  onMessageSent?: (messageId: string) => void
  className?: string
}

type InputMode = 'qimen' | 'chat'

export function ChatInput({ onQimenGenerated, onMessageSent, className }: ChatInputProps) {
  const [mode, setMode] = useState<InputMode>('qimen')
  const [isLoading, setIsLoading] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  
  // Qimen input states
  const [qimenInput, setQimenInput] = useState<Partial<QimenInput>>({
    datetime: new Date(),
    questionType: 'general',
    gender: 'male',
    ju_model: 0,
    pan_model: 1,
    zhen: 2
  })
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Store hooks
  const { generateReport, isGenerating, error: qimenError } = useQimenStore()
  const { 
    createConversation, 
    getCurrentConversation, 
    addMessageToConversation,
    setCurrentConversation,
    currentConversationId 
  } = useConversationStore()
  const { addMessage } = useChatStore()
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [chatMessage])
  
  // Check if we have a current conversation with Qimen report
  const currentConversation = getCurrentConversation()
  const hasQimenReport = currentConversation?.qimenReport
  
  // Auto-switch to chat mode if we have a Qimen report
  useEffect(() => {
    if (hasQimenReport) {
      setMode('chat')
    }
  }, [hasQimenReport])
  
  const handleQimenSubmit = async () => {
    if (!qimenInput.datetime || !qimenInput.questionType) {
      return
    }
    
    setIsLoading(true)
    
    try {
      const input: QimenInput = {
        datetime: qimenInput.datetime,
        questionType: qimenInput.questionType,
        gender: qimenInput.gender || 'male',
        year: qimenInput.datetime.getFullYear(),
        month: qimenInput.datetime.getMonth() + 1,
        day: qimenInput.datetime.getDate(),
        hours: qimenInput.datetime.getHours(),
        minute: qimenInput.datetime.getMinutes(),
        ju_model: qimenInput.ju_model || 0,
        pan_model: qimenInput.pan_model || 1,
        zhen: qimenInput.zhen || 2
      }
      
      // Generate the report
      await generateReport(input)
      
      // Get the generated report from store
      const { currentReport } = useQimenStore.getState()
      
      if (currentReport) {
        // Create new conversation with the report
        const conversationId = createConversation(undefined, currentReport)
        
        // Switch to the new conversation
        setCurrentConversation(conversationId)
        
        // Switch to chat mode
        setMode('chat')
        
        // Notify parent component
        onQimenGenerated?.(currentReport.id)
        
        // Reset qimen input
        setQimenInput({
          datetime: new Date(),
          questionType: 'general',
          gender: 'male',
          ju_model: 0,
          pan_model: 1,
          zhen: 2
        })
      }
    } catch (error) {
      console.error('Failed to generate Qimen report:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleChatSubmit = async () => {
    if (!chatMessage.trim()) return
    
    const currentConv = getCurrentConversation()
    if (!currentConv) {
      // Create a new conversation if none exists
      createConversation()
    }
    
    const userMessage = {
      id: nanoid(),
      role: 'user' as MessageRole,
      content: chatMessage.trim(),
      timestamp: Date.now()
    }
    
    // Add user message to conversation
    const conversationId = getCurrentConversation()?.id || currentConversationId
    if (conversationId) {
      addMessageToConversation(conversationId, userMessage)
    }
    
    // Also add to global chat store for compatibility
    addMessage(userMessage.role, userMessage.content)
    
    // Clear input
    const messageToSend = chatMessage
    setChatMessage('')
    
    // Notify parent
    onMessageSent?.(userMessage.id)
    
    setIsLoading(true)
    
    try {
      // Get conversation history
      const conversation = getCurrentConversation()
      const history = conversation?.messages || []
      
      // Send to AI service
      const aiResponse = await AIService.sendMessage(
        messageToSend,
        history,
        conversation?.qimenReport
      )
      
      // Add AI response to conversation
      if (conversationId) {
        addMessageToConversation(conversationId, aiResponse)
      }
      
      // Also add to global chat store
      addMessage(aiResponse.role, aiResponse.content)
      
    } catch (error) {
      console.error('Failed to get AI response:', error)
      
      // Add error message
      const errorMessage = {
        id: nanoid(),
        role: 'assistant' as MessageRole,
        content: '抱歉，我现在无法回复您的消息。请稍后再试。',
        timestamp: Date.now()
      }
      
      if (conversationId) {
        addMessageToConversation(conversationId, errorMessage)
      }
      addMessage(errorMessage.role, errorMessage.content)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (mode === 'qimen') {
        handleQimenSubmit()
      } else {
        handleChatSubmit()
      }
    }
  }
  
  const questionTypes: { value: QuestionType; label: string }[] = [
    { value: 'general', label: '综合运势' },
    { value: 'career', label: '事业财运' },
    { value: 'relationship', label: '感情婚姻' },
    { value: 'health', label: '健康状况' },
    { value: 'study', label: '学业考试' }
  ]
  
  return (
    <Card className={`p-4 ${className}`}>
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={mode === 'qimen' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('qimen')}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          奇门排盘
        </Button>
        <Button
          variant={mode === 'chat' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('chat')}
          disabled={isLoading || !hasQimenReport}
          className="flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          AI对话
        </Button>
      </div>
      
      {mode === 'qimen' ? (
        /* Qimen Input Form */
        <div className="space-y-4">
          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">日期</label>
              <Input
                type="date"
                value={qimenInput.datetime?.toISOString().split('T')[0] || ''}
                onChange={(e) => {
                  const date = new Date(e.target.value)
                  if (qimenInput.datetime) {
                    date.setHours(qimenInput.datetime.getHours())
                    date.setMinutes(qimenInput.datetime.getMinutes())
                  }
                  setQimenInput(prev => ({ ...prev, datetime: date }))
                }}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">时间</label>
              <Input
                type="time"
                value={qimenInput.datetime ? 
                  `${qimenInput.datetime.getHours().toString().padStart(2, '0')}:${qimenInput.datetime.getMinutes().toString().padStart(2, '0')}` 
                  : ''
                }
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':').map(Number)
                  const date = new Date(qimenInput.datetime || new Date())
                  date.setHours(hours)
                  date.setMinutes(minutes)
                  setQimenInput(prev => ({ ...prev, datetime: date }))
                }}
                className="w-full"
              />
            </div>
          </div>
          
          {/* Question Type */}
          <div>
            <label className="text-sm font-medium mb-2 block">问题类型</label>
            <select
              value={qimenInput.questionType || 'general'}
              onChange={(e) => setQimenInput(prev => ({ 
                ...prev, 
                questionType: e.target.value as QuestionType 
              }))}
              className="w-full p-2 border border-input rounded-md bg-background"
            >
              {questionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Gender */}
          <div>
            <label className="text-sm font-medium mb-2 block">性别</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="male"
                  checked={qimenInput.gender === 'male'}
                  onChange={(e) => setQimenInput(prev => ({ 
                    ...prev, 
                    gender: e.target.value as 'male' | 'female' 
                  }))}
                />
                男
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="female"
                  checked={qimenInput.gender === 'female'}
                  onChange={(e) => setQimenInput(prev => ({ 
                    ...prev, 
                    gender: e.target.value as 'male' | 'female' 
                  }))}
                />
                女
              </label>
            </div>
          </div>
          
          {/* Submit Button */}
          <Button
            onClick={handleQimenSubmit}
            disabled={isLoading || isGenerating || !qimenInput.datetime || !qimenInput.questionType}
            className="w-full"
          >
            {isLoading || isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                生成排盘中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                生成奇门遁甲排盘
              </>
            )}
          </Button>
          
          {qimenError && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {qimenError}
            </div>
          )}
        </div>
      ) : (
        /* Chat Input */
        <div className="space-y-4">
          {!hasQimenReport && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
              请先生成奇门遁甲排盘，然后就可以开始AI对话了。
            </div>
          )}
          
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={hasQimenReport ? "请输入您的问题..." : "请先生成排盘"}
              disabled={isLoading || !hasQimenReport}
              className="min-h-[60px] max-h-[200px] resize-none"
              rows={1}
            />
            <Button
              onClick={handleChatSubmit}
              disabled={isLoading || !chatMessage.trim() || !hasQimenReport}
              size="icon"
              className="self-end"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {hasQimenReport && (
            <div className="text-xs text-muted-foreground">
              基于 {currentConversation?.qimenReport?.result.basicInfo.gongli} 的排盘结果进行对话
            </div>
          )}
        </div>
      )}
    </Card>
  )
}