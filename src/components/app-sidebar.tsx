"use client"

import * as React from "react"
import {
  MessageSquare,
  Plus,
  Sparkles,
  Trash2,
  Sun,
  Moon,
  Monitor,
  Settings,
  History,
  MoreHorizontal,
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
import { useThemeStore, getThemeIcon, getThemeLabel } from "@/store/useThemeStore"
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
    clearAllConversations 
  } = useConversationStore()
  
  const { theme, toggleTheme } = useThemeStore()
  const [showClearAllDialog, setShowClearAllDialog] = React.useState(false)
  
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
  
  const handleClearAll = React.useCallback(() => {
    setShowClearAllDialog(true)
  }, [])
  
  const confirmClearAll = React.useCallback(() => {
    clearAllConversations()
    setShowClearAllDialog(false)
  }, [clearAllConversations])
  
  // 使用 useMemo 优化主题图标渲染
  const themeIconComponent = React.useMemo(() => {
    const iconName = getThemeIcon(theme)
    const iconProps = { className: "w-4 h-4" }
    
    switch (iconName) {
      case 'sun':
        return <Sun {...iconProps} />
      case 'moon':
        return <Moon {...iconProps} />
      case 'monitor':
        return <Monitor {...iconProps} />
      default:
        return <Moon {...iconProps} />
    }
  }, [theme])
  
  // 使用 useMemo 优化对话列表渲染
  const conversationList = React.useMemo(() => {
    if (conversations.length === 0) {
      return (
        <div className="text-sm text-muted-foreground p-4 text-center">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>暂无对话记录</p>
          <p className="text-xs mt-1">点击上方按钮开始新对话</p>
        </div>
      )
    }
    
    return (
      <ScrollArea className="h-[400px]">
        <SidebarMenu>
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={currentConversationId === conversation.id}
              onSelect={handleSelectConversation}
              onDelete={handleDeleteConversation}
            />
          ))}
        </SidebarMenu>
      </ScrollArea>
    )
  }, [conversations, currentConversationId, handleSelectConversation, handleDeleteConversation])
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground py-3">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Sparkles className="size-4" />
              </div>
              <div className="grid flex-1 text-left leading-relaxed ml-1">
                <span className="truncate font-semibold text-base">奇门遁甲</span>
                <span className="truncate text-xs text-muted-foreground mt-0.5">AI智能解读</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        {/* New Conversation Button */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Button 
                  onClick={handleNewConversation}
                  className="w-full justify-start gap-2"
                  variant="outline"
                >
                  <Plus className="w-4 h-4" />
                  <span className="group-data-[collapsible=icon]:hidden">新建对话</span>
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Conversation History */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="flex items-center gap-2">
            <History className="w-4 h-4" />
            <span className="group-data-[collapsible=icon]:hidden">对话历史</span>
            {conversations.length > 0 && (
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded group-data-[collapsible=icon]:hidden">
                {conversations.length}
              </span>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent className="flex-1">
            {conversationList}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          {/* Clear All Button */}
          {conversations.length > 0 && (
            <SidebarMenuItem>
              <Button 
                onClick={handleClearAll}
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive transition-colors"
                aria-label="清空所有对话"
              >
                <Trash2 className="w-4 h-4" />
                <span className="group-data-[collapsible=icon]:hidden">清空所有对话</span>
              </Button>
            </SidebarMenuItem>
          )}
          
          {/* Theme Toggle */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={toggleTheme} 
              className="gap-2 transition-colors hover:bg-sidebar-accent"
              aria-label={`切换主题，当前: ${getThemeLabel(theme)}`}
            >
              {themeIconComponent}
              <span className="group-data-[collapsible=icon]:hidden">{getThemeLabel(theme)}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* Settings */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              className="gap-2 transition-colors hover:bg-sidebar-accent"
              aria-label="打开设置"
            >
              <Settings className="w-4 h-4" />
              <span className="group-data-[collapsible=icon]:hidden">设置</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />
      
      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认清空所有对话</AlertDialogTitle>
            <AlertDialogDescription>
              确定要清空所有对话记录吗？这将删除 {conversations.length} 个对话，此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmClearAll} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              清空所有
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  )
}