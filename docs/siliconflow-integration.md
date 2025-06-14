# SiliconFlow AI 聊天功能集成指南

本文档介绍如何在奇门遁甲应用中集成和使用 SiliconFlow AI 聊天功能。

## 功能概述

本应用已集成 SiliconFlow AI API，提供以下功能：

- **智能对话**：基于奇门遁甲排盘结果进行专业解读
- **流式响应**：支持实时打字效果的流式回复
- **上下文理解**：保持对话历史和排盘信息的上下文
- **自动回退**：API 不可用时自动使用模拟响应

## 配置步骤

### 1. 获取 SiliconFlow API 密钥

1. 访问 [SiliconFlow 官网](https://cloud.siliconflow.cn)
2. 注册账号并登录
3. 在控制台中创建新的 API 密钥
4. 复制生成的 API 密钥

### 2. 配置环境变量

在项目根目录的 `.env.local` 文件中添加：

```env
# SiliconFlow AI API配置
NEXT_PUBLIC_SILICONFLOW_API_KEY=your_actual_api_key_here
```

**注意**：请将 `your_actual_api_key_here` 替换为您实际的 API 密钥。

### 3. 重启开发服务器

配置完成后，重启开发服务器以使环境变量生效：

```bash
npm run dev
```

## 使用方法

### 1. 生成奇门遁甲排盘

1. 在应用中选择「奇门排盘」模式
2. 输入相关信息（时间、问题类型等）
3. 点击生成排盘

### 2. 开始 AI 对话

1. 排盘生成后，自动切换到「AI对话」模式
2. 输入您的问题或需要咨询的内容
3. AI 将基于排盘结果提供专业解读

### 3. 对话功能

- **上下文保持**：AI 会记住之前的对话内容
- **专业解读**：基于奇门遁甲理论提供建议
- **实时响应**：支持流式打字效果

## 技术实现

### API 集成

应用使用 SiliconFlow 的 OpenAI 兼容 API：

- **端点**：`https://api.siliconflow.cn/v1/chat/completions`
- **模型**：`deepseek-chat`（可在代码中配置）
- **功能**：支持流式和非流式响应

### 关键特性

1. **智能回退**：API 不可用时自动使用本地模拟响应
2. **错误处理**：完善的错误处理和用户提示
3. **性能优化**：支持流式响应，提升用户体验
4. **安全性**：API 密钥通过环境变量管理

### 代码结构

```
src/lib/ai-service.ts          # AI 服务主文件
├── callSiliconFlowAPI()       # 标准 API 调用
├── callSiliconFlowStreamAPI() # 流式 API 调用
├── buildMessages()            # 构建消息格式
└── mockAIResponse()           # 模拟响应（回退）
```

## 配置选项

### 模型参数

在 `ai-service.ts` 中可以调整以下参数：

```typescript
{
  model: 'deepseek-chat',        // 使用的模型
  temperature: 0.7,              // 创造性 (0.0-2.0)
  max_tokens: 2000,              // 最大生成长度
  top_p: 0.9,                    // 核采样参数
  stream: true                   // 是否流式响应
}
```

### 支持的模型

根据 SiliconFlow 文档，支持的模型包括：
- `deepseek-chat`
- `Qwen/Qwen2.5-7B-Instruct`
- `meta-llama/Meta-Llama-3.1-8B-Instruct`
- 等其他开源模型

## 故障排除

### 常见问题

1. **API 密钥无效**
   - 检查 `.env.local` 文件中的密钥是否正确
   - 确认密钥在 SiliconFlow 控制台中有效

2. **网络连接问题**
   - 检查网络连接
   - 确认防火墙设置

3. **模型不可用**
   - 检查所选模型是否在 SiliconFlow 中可用
   - 尝试切换到其他模型

### 调试方法

1. **检查 API 状态**：
   ```javascript
   console.log(AIService.getAPIStatus())
   ```

2. **查看控制台日志**：
   - 打开浏览器开发者工具
   - 查看 Console 标签页中的错误信息

3. **验证配置**：
   ```javascript
   console.log(AIService.validateConfig())
   ```

## 最佳实践

1. **API 密钥安全**：
   - 不要将 API 密钥提交到版本控制系统
   - 使用环境变量管理敏感信息

2. **错误处理**：
   - 应用已实现自动回退机制
   - 用户在 API 不可用时仍可正常使用

3. **性能优化**：
   - 使用流式响应提升用户体验
   - 合理设置 `max_tokens` 控制响应长度

## 更新日志

- **v1.0.0**：初始集成 SiliconFlow API
- 支持标准和流式响应
- 实现自动回退机制
- 添加完善的错误处理

## 相关链接

- [SiliconFlow 官方文档](https://docs.siliconflow.cn/)
- [SiliconFlow API 参考](https://docs.siliconflow.cn/reference/chat-completions-1)
- [支持的模型列表](https://cloud.siliconflow.cn/models)