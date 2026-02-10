'use client'

import { useEffect } from 'react'
import { ChatArea } from "@/components/chat-area"
import { ChatInput } from "@/components/chat-input"
import { useChatStore } from "@/store/useChatStore"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default function Home() {
  const { clearMessages } = useChatStore()
  
  // 清理页面刷新后的状态残留问题
  useEffect(() => {
    // 清空全局聊天消息，因为现在使用对话级别的消息管理
    clearMessages()
  }, [])

  return (
    <div className="flex flex-1 flex-col h-full bg-background/30">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1">
          <h1 className="text-sm font-medium tracking-wide">奇门遁甲 AI 智能解读</h1>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full h-full">
            {/* 聊天区域 */}
            <div className="flex-1 min-h-0 w-full">
                <ChatArea className="h-full" />
            </div>
              
            {/* 输入区域 */}
            <div className="flex-shrink-0 p-4 pb-6 w-full bg-gradient-to-t from-background via-background to-transparent">
                <ChatInput className="max-w-4xl mx-auto" />
            </div>
        </div>
      </div>
    </div>
  )
}
