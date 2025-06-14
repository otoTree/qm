'use client'

import React, { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from '@/types/chatmessage'
import { MessageSquare, User, Bot, Clock } from 'lucide-react'
import { useConversationStore } from '@/store/useConversationStore'
import { useChatStore } from '@/store/useChatStore'
import { useIsMobile } from '@/hooks/use-mobile'

interface ChatAreaProps {
  className?: string
}

export function ChatArea({ className }: ChatAreaProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { getCurrentConversation } = useConversationStore()
  const { messages: globalMessages } = useChatStore()
  const isMobile = useIsMobile()
  
  // Get messages from current conversation or fallback to global messages
  const currentConversation = getCurrentConversation()
  const messages = currentConversation?.messages || globalMessages
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const isUser = message.role === 'user'
    
    return (
      <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted text-muted-foreground'
        }`}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>
        
        {/* Message Content */}
        <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
          <div className={`inline-block p-3 rounded-lg ${
            isUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-foreground'
          }`}>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </div>
          </div>
          
          {/* Timestamp */}
          <div className={`text-xs text-muted-foreground mt-1 flex items-center gap-1 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}>
            <Clock className="w-3 h-3" />
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    )
  }
  
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">开始对话</h3>
      <p className="text-muted-foreground text-sm max-w-md">
        {currentConversation?.qimenReport 
          ? '基于您的奇门遁甲排盘结果，我可以为您提供专业的解读和建议。请在下方输入您的问题。'
          : '请先生成奇门遁甲排盘，然后就可以开始AI对话了。'
        }
      </p>
    </div>
  )
  
  return (
    <Card className={`flex flex-col ${className || 'h-full'}`}>
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            AI对话
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {currentConversation?.qimenReport && (
              <Badge variant="secondary" className="text-xs">
                基于排盘结果
              </Badge>
            )}
            
            {messages.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {messages.length} 条消息
              </Badge>
            )}
          </div>
        </div>
        
        {/* Conversation Info */}
        {currentConversation && (
          <div className="text-sm text-muted-foreground">
            {currentConversation.qimenReport ? (
              <div className="flex items-center gap-2">
                <span>排盘时间：{currentConversation.qimenReport.result.basicInfo.gongli}</span>
                <span>•</span>
                <span>问题类型：{currentConversation.qimenReport.input.questionType}</span>
              </div>
            ) : (
              <span>普通对话模式</span>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <ScrollArea 
            ref={scrollAreaRef} 
            className={isMobile 
              ? "h-[calc(100vh-320px)]" 
              : "h-[calc(100vh-280px)]"
            }
          >
            <div className="space-y-4 p-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}