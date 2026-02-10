// types.ts
export type MessageRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  id: string;         // 唯一ID（用于更新/删除）
  role: MessageRole;
  content: string;
  timestamp: number;  // 时间戳
  type?: 'text' | 'report'; // 消息类型
  reportId?: string;  // 关联的排盘报告ID
}

export interface ChatState {
  messages: ChatMessage[];
  addMessage: (role: MessageRole, content: string, type?: 'text' | 'report', reportId?: string) => void;
  updateMessage: (id: string, content: string) => void;
  clearMessages: () => void;
}