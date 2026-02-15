"use client"

import * as React from "react"
import {
  MessageSquare,
  Plus,
  Sparkles,
  Trash2,
  MoreHorizontal,
  User,
  Settings,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useConversationStore, formatConversationTime } from "@/store/useConversationStore"
import { useUserStore } from "@/store/useUserStore"
import { ChartManagerDialog } from "@/components/chart-manager-dialog"
import { UserProfileDialog } from "@/components/user-profile-dialog"
import { cn } from "@/lib/utils"

// 对话项组件 - 使用 memo 优化性能
const ConversationItem = React.memo(({ 
  conversation, 
  isActive, 
  onSelect, 
  onDelete 
}: {
  conversation: any
  isActive: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  
  const handleDelete = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteDialog(true)
  }, [])
  
  const confirmDelete = React.useCallback(() => {
    onDelete(conversation.id)
    setShowDeleteDialog(false)
  }, [conversation.id, onDelete])
  
  const handleSelect = React.useCallback(() => {
    onSelect(conversation.id)
  }, [conversation.id, onSelect])
  
  return (
    <>
      <SidebarMenuItem>
        <div className="relative group overflow-hidden rounded-md">
          <SidebarMenuButton
            onClick={handleSelect}
            className={cn(
              "w-full justify-start text-left h-auto min-h-[60px] py-3 pr-12 overflow-hidden transition-colors",
              "hover:bg-sidebar-accent/50",
              isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
            aria-label={`选择对话: ${conversation.title}`}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden space-y-1">
                <div className="truncate text-sm font-medium max-w-[160px]" title={conversation.title}>
                  {conversation.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatConversationTime(conversation.updatedAt)}
                </div>
                {conversation.qimenReport && (
                  <div className="text-xs text-primary font-medium">
                    含排盘结果
                  </div>
                )}
              </div>
            </div>
          </SidebarMenuButton>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 h-8 w-8 flex-shrink-0 group-data-[collapsible=icon]:hidden hover:bg-destructive/10 hover:text-destructive absolute right-2 top-1/2 -translate-y-1/2 z-10 transition-opacity"
                aria-label="对话操作"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                删除对话
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarMenuItem>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除对话 "{conversation.title}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
})

ConversationItem.displayName = "ConversationItem"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { 
    conversations, 
    currentConversationId, 
    createConversation, 
    setCurrentConversation,
    deleteConversation,
  } = useConversationStore()
  
  const { setOpen: setUserProfileOpen, setChartManagerOpen } = useUserStore()

  // 使用 useCallback 优化回调函数
  const handleNewConversation = React.useCallback(() => {
    // 创建新对话时清除当前奇门报告，让用户重新生成
    const newConversationId = createConversation('新对话')
    // 确保切换到新创建的对话
    setCurrentConversation(newConversationId)
  }, [createConversation, setCurrentConversation])
  
  const handleSelectConversation = React.useCallback((id: string) => {
    setCurrentConversation(id)
  }, [setCurrentConversation])
  
  const handleDeleteConversation = React.useCallback((id: string) => {
    deleteConversation(id)
  }, [deleteConversation])
  
  return (
    <Sidebar className="border-r border-border/40" {...props}>
      <SidebarHeader className="p-4 border-b border-border/40">
        <Button 
          onClick={handleNewConversation}
          className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-none font-normal"
          size="lg"
        >
          <Plus className="w-4 h-4" />
          <span className="group-data-[collapsible=icon]:hidden">新建排盘</span>
        </Button>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            历史记录
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2">
              {/* 历史记录列表 */}
              <ScrollArea className="h-[calc(100vh-180px)]">
                <div className="space-y-1 pr-3">
                  {conversations.length > 0 ? (
                    conversations.map((conversation) => (
                      <ConversationItem 
                        key={conversation.id}
                        conversation={conversation}
                        isActive={currentConversationId === conversation.id}
                        onSelect={handleSelectConversation}
                        onDelete={handleDeleteConversation}
                      />
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      <p>暂无历史记录</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-border/40 p-4 space-y-2">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2" 
          onClick={() => setUserProfileOpen(true)}
        >
          <User className="w-4 h-4" />
          <span className="group-data-[collapsible=icon]:hidden">我的命盘</span>
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2" 
          onClick={() => setChartManagerOpen(true)}
        >
          <Settings className="w-4 h-4" />
          <span className="group-data-[collapsible=icon]:hidden">排盘管理</span>
        </Button>
        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center opacity-60">
          <Sparkles className="w-3 h-3" />
          <span className="group-data-[collapsible=icon]:hidden font-light tracking-wide">奇门遁甲 AI</span>
        </div>
      </SidebarFooter>
      <SidebarRail />
      <UserProfileDialog />
      <ChartManagerDialog />
    </Sidebar>
  )
}