# 奇门遁甲聊天应用开发文档

## 项目概述

基于 Next.js 15 + shadcn/ui + Zustand 构建的奇门遁甲聊天应用，支持生成奇门遁甲报告并与AI进行相关对话。

## 技术栈

- **前端框架**: Next.js 15 (App Router)
- **UI组件库**: shadcn/ui + Radix UI
- **状态管理**: Zustand
- **数据持久化**: Dexie (IndexedDB)
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **类型检查**: TypeScript

## 项目结构

```
src/
├── app/
│   ├── layout.tsx          # 根布局，包含侧边栏
│   ├── page.tsx             # 主页面
│   └── globals.css          # 全局样式
├── components/
│   ├── ui/                  # shadcn/ui 基础组件
│   ├── app-sidebar.tsx      # 应用侧边栏
│   ├── app-card.tsx         # 主要内容卡片
│   ├── chat-input.tsx       # 聊天输入组件 (待开发)
│   ├── qimen-report.tsx     # 奇门遁甲报告组件 (待开发)
│   ├── chat-area.tsx        # 聊天区域组件 (待开发)
│   └── theme-toggle.tsx     # 主题切换组件 (待开发)
├── store/
│   ├── useChatStore.ts      # 聊天状态管理
│   ├── useQimenStore.ts     # 奇门遁甲状态管理 (待开发)
│   └── useThemeStore.ts     # 主题状态管理 (待开发)
├── types/
│   ├── chatmessage.ts       # 聊天消息类型
│   └── qimen.ts             # 奇门遁甲类型 (待开发)
├── lib/
│   ├── utils.ts             # 工具函数
│   ├── qimen-calculator.ts  # 奇门遁甲计算逻辑 (待开发)
│   └── ai-service.ts        # AI服务接口 (待开发)
└── hooks/
    ├── use-mobile.ts        # 移动端检测
    └── use-qimen.ts         # 奇门遁甲钩子 (待开发)
```

## 核心功能设计

### 1. 侧边栏功能

**组件**: `app-sidebar.tsx`

**功能需求**:
- 显示历史对话列表
- 新增对话按钮
- 主题切换按钮 (明暗模式)
- 对话管理 (删除、重命名)

**状态管理**:
```typescript
interface ConversationState {
  conversations: Conversation[];
  currentConversationId: string | null;
  createConversation: () => void;
  deleteConversation: (id: string) => void;
  setCurrentConversation: (id: string) => void;
}
```

### 2. 主内容区域 (双栏布局)

**组件**: `app-card.tsx` (重构)

**布局结构**:
```
┌─────────────────────────────────────────┐
│  奇门遁甲报告区域    │    AI对话区域      │
│  (qimen-report)    │   (chat-area)     │
│                    │                   │
│  - 报告展示        │   - 消息列表       │
│  - 参数输入        │   - 聊天输入框     │
│  - 生成按钮        │                   │
└─────────────────────────────────────────┘
```

### 3. 奇门遁甲报告组件

**组件**: `qimen-report.tsx`

**功能需求**:
- 时间选择器 (年月日时)
- 性别选择
- 问题类型选择
- 生成报告按钮
- 报告结果展示

**数据结构**:
```typescript
interface QimenInput {
  datetime: Date;
  gender: 'male' | 'female';
  questionType: string;
  question?: string;
}

interface QimenReport {
  id: string;
  input: QimenInput;
  result: {
    tianpan: string[];    // 天盘
    dipan: string[];      // 地盘
    renpan: string[];     // 人盘
    analysis: string;     // 分析结果
    suggestions: string[]; // 建议
  };
  timestamp: number;
}
```

### 4. AI对话组件

**组件**: `chat-area.tsx`

**功能需求**:
- 消息列表展示
- 消息类型区分 (用户/AI/系统)
- 流式响应支持
- 消息时间戳

**System Prompt**:
```typescript
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
`;
```

### 5. 聊天输入组件

**组件**: `chat-input.tsx`

**功能需求**:
- 智能状态管理
- 报告生成优先级
- 输入验证
- 发送状态反馈

**状态逻辑**:
```typescript
interface ChatInputState {
  hasReport: boolean;        // 是否已生成报告
  isGeneratingReport: boolean; // 是否正在生成报告
  isChatting: boolean;       // 是否正在聊天
  inputValue: string;
  placeholder: string;
}
```

## 状态管理设计

### 1. 聊天状态 (已实现)

**文件**: `store/useChatStore.ts`

当前已实现基础聊天功能，需要扩展支持多对话。

### 2. 奇门遁甲状态 (待开发)

**文件**: `store/useQimenStore.ts`

```typescript
interface QimenState {
  currentReport: QimenReport | null;
  reports: QimenReport[];
  isGenerating: boolean;
  generateReport: (input: QimenInput) => Promise<void>;
  setCurrentReport: (report: QimenReport) => void;
  clearCurrentReport: () => void;
}
```

### 3. 主题状态 (待开发)

**文件**: `store/useThemeStore.ts`

```typescript
interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}
```

### 4. 对话管理状态 (待开发)

**文件**: `store/useConversationStore.ts`

```typescript
interface Conversation {
  id: string;
  title: string;
  qimenReport?: QimenReport;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

interface ConversationState {
  conversations: Conversation[];
  currentConversationId: string | null;
  createConversation: (title?: string) => string;
  deleteConversation: (id: string) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  setCurrentConversation: (id: string) => void;
}
```

## 数据持久化

使用 Dexie (IndexedDB) 进行本地数据存储：

```typescript
// lib/database.ts
import Dexie, { Table } from 'dexie';

class QimenDatabase extends Dexie {
  conversations!: Table<Conversation>;
  reports!: Table<QimenReport>;
  messages!: Table<ChatMessage>;

  constructor() {
    super('QimenDatabase');
    this.version(1).stores({
      conversations: '++id, title, createdAt, updatedAt',
      reports: '++id, timestamp',
      messages: '++id, conversationId, timestamp'
    });
  }
}

export const db = new QimenDatabase();
```

## API 设计

### 1. 奇门遁甲计算 API

**文件**: `lib/qimen-calculator.ts`

```typescript
export class QimenCalculator {
  static calculate(input: QimenInput): QimenReport {
    // 奇门遁甲计算逻辑
  }
  
  static validateInput(input: QimenInput): boolean {
    // 输入验证
  }
}
```

### 2. AI 服务 API

**文件**: `lib/ai-service.ts`

```typescript
export class AIService {
  static async chat(
    messages: ChatMessage[],
    qimenReport: QimenReport
  ): Promise<ReadableStream> {
    // AI 聊天接口
  }
}
```

## 开发计划

### Phase 1: 基础架构 (1-2天)

1. **重构现有组件**
   - 更新 `app-sidebar.tsx` 支持对话管理
   - 重构 `app-card.tsx` 为双栏布局
   - 添加主题切换功能

2. **创建核心状态管理**
   - 实现 `useQimenStore.ts`
   - 实现 `useThemeStore.ts`
   - 实现 `useConversationStore.ts`

3. **设置数据库**
   - 配置 Dexie 数据库
   - 实现数据持久化

### Phase 2: 奇门遁甲功能 (2-3天)

1. **奇门遁甲计算引擎**
   - 实现基础计算逻辑
   - 添加输入验证
   - 创建报告生成器

2. **报告展示组件**
   - 设计报告UI
   - 实现参数输入表单
   - 添加报告展示区域

### Phase 3: AI 对话功能 (2-3天)

1. **聊天组件开发**
   - 实现 `chat-area.tsx`
   - 实现 `chat-input.tsx`
   - 添加流式响应支持

2. **AI 服务集成**
   - 配置 AI API
   - 实现 System Prompt
   - 添加错误处理

### Phase 4: 优化和测试 (1-2天)

1. **性能优化**
   - 组件懒加载
   - 状态优化
   - 内存管理

2. **用户体验**
   - 加载状态
   - 错误提示
   - 响应式设计

3. **测试和调试**
   - 功能测试
   - 兼容性测试
   - 性能测试

## 注意事项

1. **安全性**
   - API 密钥安全存储
   - 输入数据验证
   - XSS 防护

2. **性能**
   - 大量历史对话的分页加载
   - 图片和媒体文件的优化
   - 状态更新的防抖处理

3. **用户体验**
   - 响应式设计适配移动端
   - 加载状态的友好提示
   - 错误处理的用户友好信息

4. **可维护性**
   - 组件的模块化设计
   - 类型定义的完整性
   - 代码注释和文档

## 下一步行动

1. 确认奇门遁甲计算逻辑的具体需求
2. 选择合适的 AI 服务提供商
3. 开始 Phase 1 的开发工作
4. 设计详细的 UI/UX 原型

---

*本文档将随着开发进度持续更新*