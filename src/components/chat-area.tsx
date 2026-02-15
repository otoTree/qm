'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { ChatMessage } from '@/types/chatmessage'
import { MessageSquare, Clock, Triangle, Compass, Calendar, ChevronRight } from 'lucide-react'
import { useConversationStore } from '@/store/useConversationStore'
import { useChatStore } from '@/store/useChatStore'
import { useQimenStore } from '@/store/useQimenStore'
import { useIsMobile } from '@/hooks/use-mobile'
import { QimenReport } from '@/components/qimen-report'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ChatAreaProps {
  className?: string
}

const ReportMessage = ({ reportId }: { reportId: string }) => {
  const { getReportById } = useQimenStore()
  const report = getReportById(reportId)
  
  if (!report) return <div className="text-destructive text-sm p-2 border border-destructive/20 rounded bg-destructive/5">排盘报告加载失败</div>

  const { result } = report
  const basicInfo = result.basicInfo

  return (
    <div className="mt-2 mb-2 max-w-sm">
      <Dialog>
        <DialogTrigger asChild>
          <div className="group cursor-pointer border border-border/60 bg-background/50 hover:bg-background hover:shadow-sm hover:border-foreground/20 transition-all duration-300 rounded-sm p-4 flex flex-col gap-3">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-foreground/70">
                      <Compass className="w-4 h-4" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground font-serif">奇门遁甲</span>
                      <span className="text-sm font-medium font-serif">{basicInfo?.dunju || '排盘结果'}</span>
                   </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-colors" />
             </div>
             
             <div className="space-y-1 pl-10 border-l-2 border-secondary ml-4 py-1">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                   <Calendar className="w-3 h-3 opacity-70" />
                   {basicInfo?.gongli?.split(' ')[0]}
                </div>
                <div className="text-xs text-foreground/80 font-serif">
                   {basicInfo?.sizhu}
                </div>
             </div>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle className="font-serif tracking-wide text-center pt-2">奇门遁甲排盘详解</DialogTitle>
           </DialogHeader>
           <div className="mt-4">
              <QimenReport report={report} className="border-none shadow-none" />
           </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const MessageItem = ({ message }: { message: ChatMessage }) => {
    const isUser = message.role === 'user'
    
    return (
      <div className="flex gap-4 items-start group py-3">
        {/* Indicator */}
        <div className={`mt-2 flex-shrink-0 transition-opacity duration-300 ${isUser ? 'text-primary' : 'text-primary/60'}`}>
           <Triangle className={`w-2 h-2 ${!isUser ? 'rotate-180' : ''} fill-current`} />
        </div>
        
        {/* Content */}
        <div className="flex-1 space-y-2 overflow-hidden min-w-0">
           {message.content && (
             <div className={`text-[15px] leading-7 tracking-wide text-foreground/90 break-words ${isUser ? 'font-serif font-medium' : 'font-light'}`}>
               {isUser ? (
                 <div className="whitespace-pre-wrap">{message.content}</div>
               ) : (
                 <div className="prose prose-sm prose-stone dark:prose-invert max-w-none prose-p:leading-7 prose-p:my-2 prose-headings:font-serif prose-headings:font-normal prose-strong:font-medium">
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                            // 移除默认的段落 margin，使用 prose 类控制
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                 </div>
               )}
             </div>
           )}
           
           {message.type === 'report' && message.reportId && (
             <ReportMessage reportId={message.reportId} />
           )}
           
           {/* Timestamp - visible on hover */}
           <div className="text-[10px] text-muted-foreground/30 h-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 select-none">
             <Clock className="w-2.5 h-2.5" />
             {new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
           </div>
        </div>
      </div>
    )
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
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        }, 100)
      }
    }
  }, [messages, messages.length])
  
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
      <div className="w-12 h-12 bg-secondary/30 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
        <MessageSquare className="w-5 h-5 text-foreground/40" />
      </div>
      <h3 className="text-base font-serif font-medium tracking-wide mb-2 text-foreground/80">问卦</h3>
      <p className="text-muted-foreground text-sm max-w-xs font-light leading-relaxed">
        诚心而问，静待天机。
      </p>
    </div>
  )
  
  return (
    <Card className={`flex flex-col bg-transparent border-none shadow-none ${className || 'h-full'}`}>
      <CardHeader className="flex-shrink-0 pb-2 px-4 border-b border-border/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-serif font-medium text-foreground/80">
            <MessageSquare className="w-4 h-4" />
            <span>对话</span>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {currentConversation?.qimenReport && (
              <Badge variant="secondary" className="text-[10px] h-5 font-normal bg-secondary/50 backdrop-blur-sm font-serif">
                已排盘
              </Badge>
            )}
            
            {messages.length > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 font-normal text-muted-foreground">
                {messages.length}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden relative">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <ScrollArea 
            ref={scrollAreaRef} 
            className="h-full"
          >
            <div className="space-y-2 p-4 pb-8 max-w-3xl mx-auto">
              {messages.map((message) => (
                <MessageItem key={message.id} message={message} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
