"use client"

'use client'

import { useEffect } from 'react'
import { QimenReport } from "@/components/qimen-report"
import { ChatArea } from "@/components/chat-area"
import { ChatInput } from "@/components/chat-input"
import { useQimenStore } from "@/store/useQimenStore"
import { useConversationStore } from "@/store/useConversationStore"
import { useChatStore } from "@/store/useChatStore"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default function Home() {
  const { currentReport } = useQimenStore()
  const { currentConversationId, getCurrentConversation } = useConversationStore()
  const { clearMessages } = useChatStore()
  
  // 清理页面刷新后的状态残留问题
  useEffect(() => {
    // 清空全局聊天消息，因为现在使用对话级别的消息管理
    clearMessages()
  }, [])
  
  // 获取当前对话
  const currentConversation = getCurrentConversation()

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">奇门遁甲 AI 智能解读</h1>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="flex flex-col md:flex-row h-full">
          {/* 奇门遁甲报告 - 移动端上方，桌面端左侧 */}
          <div className="w-full md:w-1/2 flex flex-col h-1/2 md:h-full p-4 md:pr-3 pb-2 md:pb-4 border-b md:border-b-0 md:border-r">
            <div className="mb-4 flex-shrink-0">
              <h2 className="text-xl font-semibold">奇门遁甲排盘</h2>
              <p className="text-sm text-muted-foreground">输入信息生成奇门遁甲报告</p>
            </div>
            
            <div className="flex-1 overflow-auto">
              {currentReport ? (
                <QimenReport report={currentReport} />
              ) : (
                <div className="flex items-center justify-center h-full border-2 border-dashed border-muted rounded-lg">
                  <div className="text-center">
                    <p className="text-lg text-muted-foreground mb-2">暂无排盘结果</p>
                    <p className="text-sm text-muted-foreground">请在下方输入信息生成奇门遁甲报告</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* 聊天区域 - 移动端下方，桌面端右侧 */}
          <div className="w-full md:w-1/2 flex flex-col h-1/2 md:h-full p-4 pt-2 md:pt-4 md:pl-3">
            <div className="mb-4 flex-shrink-0">
              <h2 className="text-xl font-semibold">AI 智能解读</h2>
              <p className="text-sm text-muted-foreground">
                {currentConversation?.qimenReport ? '与AI对话，深入了解奇门遁甲' : '生成排盘后可与AI对话'}
              </p>
            </div>
            
            <div className="flex-1 flex flex-col min-h-0">
              {/* 聊天消息区域 - 固定高度，内部滚动 */}
              <div className="flex-1 mb-4 min-h-0">
                <ChatArea className="h-full" />
              </div>
              
              {/* 输入区域 */}
              <div className="flex-shrink-0">
                <ChatInput />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
