# 奇门遁甲聊天应用技术规范

## 组件设计规范

### 1. 侧边栏组件重构

**文件**: `src/components/app-sidebar.tsx`

```typescript
import { Plus, MessageSquare, Moon, Sun, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useConversationStore } from "@/store/useConversationStore"
import { useThemeStore } from "@/store/useThemeStore"

export function AppSidebar() {
  const {
    conversations,
    currentConversationId,
    createConversation,
    deleteConversation,
    setCurrentConversation
  } = useConversationStore()
  
  const { theme, toggleTheme } = useThemeStore()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">奇门遁甲</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </Button>
        </div>
        <Button
          onClick={createConversation}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          新建对话
        </Button>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>历史对话</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {conversations.map((conversation) => (
                <SidebarMenuItem key={conversation.id}>
                  <SidebarMenuButton
                    onClick={() => setCurrentConversation(conversation.id)}
                    isActive={currentConversationId === conversation.id}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span className="truncate">{conversation.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteConversation(conversation.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
```

### 2. 主内容区域双栏布局

**文件**: `src/components/app-card.tsx`

```typescript
import { Card, CardContent } from "@/components/ui/card"
import { QimenReport } from "@/components/qimen-report"
import { ChatArea } from "@/components/chat-area"
import { useConversationStore } from "@/store/useConversationStore"
import { useQimenStore } from "@/store/useQimenStore"

export function AppCard() {
  const { currentConversationId } = useConversationStore()
  const { currentReport } = useQimenStore()

  if (!currentConversationId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">请选择或创建一个对话</p>
      </div>
    )
  }

  return (
    <div className="h-full w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 奇门遁甲报告区域 */}
      <Card className="h-full">
        <CardContent className="p-6 h-full">
          <QimenReport />
        </CardContent>
      </Card>
      
      {/* AI对话区域 */}
      <Card className="h-full">
        <CardContent className="p-0 h-full">
          <ChatArea />
        </CardContent>
      </Card>
    </div>
  )
}
```

### 3. 奇门遁甲报告组件

**文件**: `src/components/qimen-report.tsx`

```typescript
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useQimenStore } from "@/store/useQimenStore"
import { QimenInput } from "@/types/qimen"

export function QimenReport() {
  const { currentReport, isGenerating, generateReport } = useQimenStore()
  const [input, setInput] = useState<QimenInput>({
    datetime: new Date(),
    gender: 'male',
    questionType: 'general',
    question: ''
  })

  const handleGenerate = async () => {
    await generateReport(input)
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* 输入表单 */}
      <Card>
        <CardHeader>
          <CardTitle>奇门遁甲起局</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="datetime">时间</Label>
              <Input
                id="datetime"
                type="datetime-local"
                value={input.datetime.toISOString().slice(0, 16)}
                onChange={(e) => setInput(prev => ({
                  ...prev,
                  datetime: new Date(e.target.value)
                }))}
              />
            </div>
            <div>
              <Label htmlFor="gender">性别</Label>
              <Select
                value={input.gender}
                onValueChange={(value: 'male' | 'female') => 
                  setInput(prev => ({ ...prev, gender: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="female">女</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="questionType">问题类型</Label>
            <Select
              value={input.questionType}
              onValueChange={(value) => 
                setInput(prev => ({ ...prev, questionType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">综合运势</SelectItem>
                <SelectItem value="career">事业财运</SelectItem>
                <SelectItem value="relationship">感情婚姻</SelectItem>
                <SelectItem value="health">健康状况</SelectItem>
                <SelectItem value="study">学业考试</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="question">具体问题 (可选)</Label>
            <Input
              id="question"
              placeholder="请描述您想咨询的具体问题..."
              value={input.question}
              onChange={(e) => setInput(prev => ({
                ...prev,
                question: e.target.value
              }))}
            />
          </div>
          
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? '正在生成...' : '生成奇门遁甲报告'}
          </Button>
        </CardContent>
      </Card>

      {/* 报告展示 */}
      {currentReport && (
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>奇门遁甲报告</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <h4 className="font-semibold mb-2">天盘</h4>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  {currentReport.result.tianpan.map((item, index) => (
                    <div key={index} className="p-1 border rounded">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">人盘</h4>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  {currentReport.result.renpan.map((item, index) => (
                    <div key={index} className="p-1 border rounded">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">地盘</h4>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  {currentReport.result.dipan.map((item, index) => (
                    <div key={index} className="p-1 border rounded">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-semibold mb-2">分析结果</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {currentReport.result.analysis}
              </p>
            </div>
            
            {currentReport.result.suggestions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">建议</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {currentReport.result.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

### 4. 聊天区域组件

**文件**: `src/components/chat-area.tsx`

```typescript
import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatInput } from "@/components/chat-input"
import { MessageBubble } from "@/components/message-bubble"
import { useConversationStore } from "@/store/useConversationStore"
import { useChatStore } from "@/store/useChatStore"
import { useQimenStore } from "@/store/useQimenStore"

export function ChatArea() {
  const { currentConversationId } = useConversationStore()
  const { messages } = useChatStore()
  const { currentReport } = useQimenStore()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const hasReport = !!currentReport
  const canChat = hasReport

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">AI 对话</CardTitle>
        {!hasReport && (
          <p className="text-sm text-muted-foreground">
            请先生成奇门遁甲报告后再开始对话
          </p>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* 消息列表 */}
        <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
            {messages.length === 0 && hasReport && (
              <div className="text-center text-muted-foreground py-8">
                <p>开始与AI老师讨论您的奇门遁甲报告吧！</p>
              </div>
            )}
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        </ScrollArea>
        
        {/* 输入区域 */}
        <div className="border-t p-4">
          <ChatInput disabled={!canChat} />
        </div>
      </CardContent>
    </div>
  )
}
```

### 5. 聊天输入组件

**文件**: `src/components/chat-input.tsx`

```typescript
import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useChatStore } from "@/store/useChatStore"
import { useQimenStore } from "@/store/useQimenStore"
import { AIService } from "@/lib/ai-service"

interface ChatInputProps {
  disabled?: boolean
}

export function ChatInput({ disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { addMessage, updateMessage } = useChatStore()
  const { currentReport } = useQimenStore()

  const handleSubmit = async () => {
    if (!input.trim() || !currentReport || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    try {
      // 添加用户消息
      addMessage('user', userMessage)
      
      // 创建AI消息占位符
      const aiMessageId = Date.now().toString()
      addMessage('assistant', '')
      
      // 调用AI服务
      const stream = await AIService.chat(
        [{ role: 'user', content: userMessage }],
        currentReport
      )
      
      // 处理流式响应
      const reader = stream.getReader()
      let accumulatedContent = ''
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = new TextDecoder().decode(value)
        accumulatedContent += chunk
        updateMessage(aiMessageId, chunk)
      }
    } catch (error) {
      console.error('Chat error:', error)
      addMessage('assistant', '抱歉，发生了错误，请稍后重试。')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const placeholder = disabled
    ? '请先生成奇门遁甲报告...'
    : '输入您的问题...'

  return (
    <div className="flex space-x-2">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        className="min-h-[60px] resize-none"
        rows={2}
      />
      <Button
        onClick={handleSubmit}
        disabled={disabled || !input.trim() || isLoading}
        size="icon"
        className="self-end"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}
```

## 状态管理实现

### 1. 奇门遁甲状态管理

**文件**: `src/store/useQimenStore.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { QimenInput, QimenReport } from '@/types/qimen'
import { QimenCalculator } from '@/lib/qimen-calculator'

interface QimenState {
  currentReport: QimenReport | null
  reports: QimenReport[]
  isGenerating: boolean
  generateReport: (input: QimenInput) => Promise<void>
  setCurrentReport: (report: QimenReport | null) => void
  clearCurrentReport: () => void
  getReportById: (id: string) => QimenReport | undefined
}

export const useQimenStore = create<QimenState>()()
  persist(
    (set, get) => ({
      currentReport: null,
      reports: [],
      isGenerating: false,

      generateReport: async (input: QimenInput) => {
        set({ isGenerating: true })
        try {
          const report = await QimenCalculator.calculate(input)
          set((state) => ({
            currentReport: report,
            reports: [report, ...state.reports],
            isGenerating: false
          }))
        } catch (error) {
          console.error('Generate report error:', error)
          set({ isGenerating: false })
        }
      },

      setCurrentReport: (report) => set({ currentReport: report }),
      
      clearCurrentReport: () => set({ currentReport: null }),
      
      getReportById: (id) => {
        return get().reports.find(report => report.id === id)
      }
    }),
    {
      name: 'qimen-storage',
      partialize: (state) => ({
        reports: state.reports,
        currentReport: state.currentReport
      })
    }
  )
)
```

### 2. 主题状态管理

**文件**: `src/store/useThemeStore.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()()
  persist(
    (set, get) => ({
      theme: 'dark',
      
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })
        document.documentElement.className = newTheme
      },
      
      setTheme: (theme) => {
        set({ theme })
        document.documentElement.className = theme
      }
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          document.documentElement.className = state.theme
        }
      }
    }
  )
)
```

### 3. 对话管理状态

**文件**: `src/store/useConversationStore.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { Conversation } from '@/types/conversation'

interface ConversationState {
  conversations: Conversation[]
  currentConversationId: string | null
  createConversation: (title?: string) => string
  deleteConversation: (id: string) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  setCurrentConversation: (id: string) => void
  getCurrentConversation: () => Conversation | null
}

export const useConversationStore = create<ConversationState>()()
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,

      createConversation: (title = '新对话') => {
        const id = nanoid()
        const conversation: Conversation = {
          id,
          title,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          currentConversationId: id
        }))
        
        return id
      },

      deleteConversation: (id) => {
        set((state) => {
          const newConversations = state.conversations.filter(c => c.id !== id)
          const newCurrentId = state.currentConversationId === id
            ? (newConversations[0]?.id || null)
            : state.currentConversationId
            
          return {
            conversations: newConversations,
            currentConversationId: newCurrentId
          }
        })
      },

      updateConversation: (id, updates) => {
        set((state) => ({
          conversations: state.conversations.map(c =>
            c.id === id
              ? { ...c, ...updates, updatedAt: Date.now() }
              : c
          )
        }))
      },

      setCurrentConversation: (id) => {
        set({ currentConversationId: id })
      },

      getCurrentConversation: () => {
        const { conversations, currentConversationId } = get()
        return conversations.find(c => c.id === currentConversationId) || null
      }
    }),
    {
      name: 'conversation-storage'
    }
  )
)
```

## 类型定义

### 1. 奇门遁甲类型

**文件**: `src/types/qimen.ts`

```typescript
export interface QimenInput {
  datetime: Date
  gender: 'male' | 'female'
  questionType: string
  question?: string
}

export interface QimenResult {
  tianpan: string[]    // 天盘 9宫格
  dipan: string[]      // 地盘 9宫格
  renpan: string[]     // 人盘 9宫格
  analysis: string     // 分析结果
  suggestions: string[] // 建议列表
}

export interface QimenReport {
  id: string
  input: QimenInput
  result: QimenResult
  timestamp: number
}

// 奇门遁甲基础元素
export interface QimenElements {
  tiangan: string[]    // 天干
  dizhi: string[]      // 地支
  jiugong: string[]    // 九宫
  bamen: string[]      // 八门
  jiuxing: string[]    // 九星
  bashen: string[]     // 八神
}
```

### 2. 对话类型

**文件**: `src/types/conversation.ts`

```typescript
import { ChatMessage } from './chatmessage'
import { QimenReport } from './qimen'

export interface Conversation {
  id: string
  title: string
  qimenReport?: QimenReport
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}
```

## 核心服务实现

### 1. 奇门遁甲计算引擎

**文件**: `src/lib/qimen-calculator.ts`

```typescript
import { QimenInput, QimenReport, QimenElements } from '@/types/qimen'
import { nanoid } from 'nanoid'

export class QimenCalculator {
  private static elements: QimenElements = {
    tiangan: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
    dizhi: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
    jiugong: ['坎一', '坤二', '震三', '巽四', '中五', '乾六', '兑七', '艮八', '离九'],
    bamen: ['休门', '死门', '伤门', '杜门', '开门', '惊门', '生门', '景门'],
    jiuxing: ['天蓬', '天芮', '天冲', '天辅', '天禽', '天心', '天柱', '天任', '天英'],
    bashen: ['值符', '腾蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天']
  }

  static async calculate(input: QimenInput): Promise<QimenReport> {
    // 验证输入
    if (!this.validateInput(input)) {
      throw new Error('Invalid input parameters')
    }

    // 模拟计算过程 (实际实现需要复杂的奇门遁甲算法)
    await new Promise(resolve => setTimeout(resolve, 1000))

    const report: QimenReport = {
      id: nanoid(),
      input,
      result: {
        tianpan: this.generateTianpan(input),
        dipan: this.generateDipan(input),
        renpan: this.generateRenpan(input),
        analysis: this.generateAnalysis(input),
        suggestions: this.generateSuggestions(input)
      },
      timestamp: Date.now()
    }

    return report
  }

  static validateInput(input: QimenInput): boolean {
    return (
      input.datetime instanceof Date &&
      ['male', 'female'].includes(input.gender) &&
      typeof input.questionType === 'string' &&
      input.questionType.length > 0
    )
  }

  private static generateTianpan(input: QimenInput): string[] {
    // 简化的天盘生成逻辑
    const { jiuxing } = this.elements
    return Array.from({ length: 9 }, (_, i) => jiuxing[i % jiuxing.length])
  }

  private static generateDipan(input: QimenInput): string[] {
    // 简化的地盘生成逻辑
    const { jiugong } = this.elements
    return jiugong.slice()
  }

  private static generateRenpan(input: QimenInput): string[] {
    // 简化的人盘生成逻辑
    const { bamen } = this.elements
    return Array.from({ length: 9 }, (_, i) => 
      i === 4 ? '中宫' : bamen[i % bamen.length]
    )
  }

  private static generateAnalysis(input: QimenInput): string {
    const questionTypes = {
      general: '综合运势分析',
      career: '事业财运分析',
      relationship: '感情婚姻分析',
      health: '健康状况分析',
      study: '学业考试分析'
    }

    return `根据您的${questionTypes[input.questionType as keyof typeof questionTypes] || '综合'}，\n\n当前时局显示...\n\n[这里是详细的奇门遁甲分析内容，实际实现时需要根据具体的奇门遁甲理论进行计算和解读]`
  }

  private static generateSuggestions(input: QimenInput): string[] {
    return [
      '建议在吉时进行重要决策',
      '注意避开不利的方位和时间',
      '可以考虑佩戴相应的吉祥物品',
      '保持积极的心态和行动'
    ]
  }
}
```

### 2. AI 服务接口

**文件**: `src/lib/ai-service.ts`

```typescript
import { ChatMessage } from '@/types/chatmessage'
import { QimenReport } from '@/types/qimen'

const QIMEN_SYSTEM_PROMPT = `
你是一位精通奇门遁甲的专业老师，具有深厚的易学功底。
你的任务是基于提供的奇门遁甲报告，为用户提供详细的解读和指导。

请遵循以下原则：
1. 基于报告内容进行专业解读
2. 用通俗易懂的语言解释复杂概念
3. 提供实用的建议和指导
4. 保持客观和理性的态度
5. 如果用户询问报告之外的内容，请引导回到当前报告的讨论

当前奇门遁甲报告：
{qimen_report}
`

export class AIService {
  private static apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
  private static apiUrl = 'https://api.openai.com/v1/chat/completions'

  static async chat(
    messages: ChatMessage[],
    qimenReport: QimenReport
  ): Promise<ReadableStream> {
    if (!this.apiKey) {
      throw new Error('API key not configured')
    }

    const systemPrompt = QIMEN_SYSTEM_PROMPT.replace(
      '{qimen_report}',
      JSON.stringify(qimenReport, null, 2)
    )

    const requestMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ]

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: requestMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.body || new ReadableStream()
  }

  // 备用的模拟AI响应 (用于开发测试)
  static async mockChat(
    messages: ChatMessage[],
    qimenReport: QimenReport
  ): Promise<ReadableStream> {
    const mockResponse = `根据您的奇门遁甲报告，我来为您详细解读：

从天盘来看，${qimenReport.result.tianpan[0]}星当值，这表示...

从人盘分析，${qimenReport.result.renpan[0]}当令，建议您...

综合来看，当前的格局对您的${qimenReport.input.questionType}方面有以下影响...`

    return new ReadableStream({
      start(controller) {
        const words = mockResponse.split('')
        let index = 0
        
        const interval = setInterval(() => {
          if (index < words.length) {
            controller.enqueue(new TextEncoder().encode(words[index]))
            index++
          } else {
            clearInterval(interval)
            controller.close()
          }
        }, 50)
      }
    })
  }
}
```

## 环境配置

### 1. 环境变量

**文件**: `.env.local`

```env
# AI 服务配置
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_AI_MODEL=gpt-3.5-turbo

# 应用配置
NEXT_PUBLIC_APP_NAME=奇门遁甲聊天助手
NEXT_PUBLIC_APP_VERSION=1.0.0

# 开发配置
NEXT_PUBLIC_DEBUG=false
```

### 2. 依赖更新

需要添加的新依赖：

```bash
npm install nanoid date-fns
npm install -D @types/node
```

## 部署注意事项

1. **API 密钥安全**：确保 OpenAI API 密钥安全存储
2. **性能优化**：实现组件懒加载和代码分割
3. **错误处理**：完善错误边界和用户友好的错误提示
4. **响应式设计**：确保在移动设备上的良好体验
5. **数据备份**：实现 IndexedDB 数据的导出/导入功能

---

*此技术规范将随开发进度持续更新和完善*