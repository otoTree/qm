import { QimenReport } from '@/types/qimen'
import { nanoid } from 'nanoid'
import { ChatMessage, MessageRole } from '@/types/chatmessage'
import { PersonProfile } from '@/store/useUserStore'

/**
 * AI服务类
 * 处理与AI的对话交互
 * 集成SiliconFlow API
 */
export class AIService {
  // SiliconFlow API配置
  private static readonly API_ENDPOINT = '/api/ai/chat'
  private static readonly DEFAULT_MODEL = 'deepseek-chat' // 使用DeepSeek模型
  // 硬编码的系统提示
  private static readonly SYSTEM_PROMPT = `
# Role: 奇门遁甲排盘分析师  
## Profile  
- language: 中文  
- description: 精通奇门遁甲排盘技术，能够结合用户问题提供精准的排盘分析和预测  
- background: 研习奇门遁甲多年，掌握传统排盘方法和现代应用技巧  
- personality: 严谨、细致、富有洞察力  
- expertise: 奇门遁甲排盘、风水布局、运势预测  
- target_audience: 对奇门遁甲感兴趣的咨询者、风水爱好者、运势预测需求者  

## Skills  
1. 排盘分析  
   - 奇门遁甲排盘: 准确排出奇门遁甲盘局  
   - 盘局解读: 分析天盘、地盘、人盘、神盘的关系  
   - 用神定位: 快速确定用神所在宫位  
   - 格局判断: 识别吉凶格局和特殊组合  

2. 预测咨询  
   - 问题对应: 将用户问题与盘局要素精准对应  
   - 趋势预测: 分析未来发展趋势  
   - 建议提供: 给出可行的调整建议  
   - 化解方案: 提供风水化解方法  

## Rules  
1. 基本原则：  
   - 尊重传统: 严格遵循奇门遁甲传统理论体系  
   - 客观分析: 基于盘局客观分析，不夸大预测结果  
   - 保护隐私: 严格保密用户个人信息  
   - 科学态度: 结合现代认知解释传统理论  
   - **身份认知**: 你的身份是"奇门遁甲 AI 智能解读助手"，你不是 DeepSeek，也不是 OpenAI 的模型。当用户询问你的身份时，请明确回答你是专门为奇门遁甲解读而设计的 AI 助手。

2. 行为准则：  
   - 详细询问: 充分了解用户问题和背景  
   - 全面分析: 综合考虑盘局各要素  
   - 明确表达: 用通俗语言解释专业术语  
   - 谨慎建议: 只提供经过验证的有效建议  

3. 限制条件：  
   - 不涉及医疗: 不提供医疗诊断建议  
   - 不绝对断言: 避免使用绝对性语言  
   - 不夸大效果: 不承诺100%准确率  
   - 不违反法律: 遵守相关法律法规  

## Workflows  
- 目标: 为用户提供专业、准确的奇门遁甲排盘分析  
- 步骤 1: 收集用户问题和基本信息  
- 步骤 2: 排出准确的奇门遁甲盘局  
- 步骤 3: 分析盘局各要素与用户问题的关联  
- 步骤 4: 给出预测结果和调整建议  
- 预期结果: 用户获得有价值的预测分析和实用建议  

## Initialization  
作为奇门遁甲排盘分析师，你必须遵守上述Rules，按照Workflows执行任务。`

  /**
   * 发送消息到AI并获取回复
   */
  static async sendMessage(
    message: string,
    conversationHistory: ChatMessage[] = [],
    qimenReport?: QimenReport,
    birthChart?: QimenReport | null,
    contextCharts?: PersonProfile[]
  ): Promise<ChatMessage> {
    try {
      // 构建消息数组
      const messages = this.buildMessages(conversationHistory, message, qimenReport, birthChart, contextCharts)
      
      // 调用SiliconFlow API (via backend)
      const response = await this.callSiliconFlowAPI(messages)
      
      return {
        id: nanoid(),
        role: 'assistant' as MessageRole,
        content: response,
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('AI service error:', error)
      
      // 如果API调用失败，回退到模拟响应
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      const fallbackResponse = `请求失败：${errorMessage}。请检查后端服务配置。`
      
      return {
        id: nanoid(),
        role: 'assistant' as MessageRole,
        content: fallbackResponse,
        timestamp: Date.now()
      }
    }
  }

  /**
   * 发送消息到AI并以流式方式获取回复
   */
  static async sendMessageStream(
    message: string,
    conversationHistory: ChatMessage[] = [],
    qimenReport: QimenReport | undefined,
    birthChart: QimenReport | null | undefined,
    onChunk: (chunk: string) => void,
    onComplete: (fullContent: string) => void,
    onError: (error: Error) => void,
    contextCharts?: PersonProfile[]
  ): Promise<void> {
    try {
      const messages = this.buildMessages(conversationHistory, message, qimenReport, birthChart, contextCharts)
      
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages,
          model: this.DEFAULT_MODEL,
          stream: true
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('Response body is empty')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices[0]?.delta?.content || ''
              if (content) {
                fullContent += content
                onChunk(content)
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e)
            }
          }
        }
      }
      
      onComplete(fullContent)
      
    } catch (error) {
      console.error('Stream error:', error)
      onError(error instanceof Error ? error : new Error('Unknown streaming error'))
    }
  }

  /**
   * 构建消息数组
   */
  private static buildMessages(
    history: ChatMessage[], 
    newMessage: string,
    qimenReport?: QimenReport,
    birthChart?: QimenReport | null,
    contextCharts?: PersonProfile[]
  ) {
    // 转换历史消息格式
    // 过滤掉 'report' 类型的消息，只保留 'text' 类型的对话
    const apiMessages = history
      .filter(msg => msg.type !== 'report') // 过滤掉排盘报告消息
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    
    // 如果有奇门排盘结果，将其作为上下文添加到系统提示中
    let systemPrompt = this.SYSTEM_PROMPT
    
    if (contextCharts && contextCharts.length > 0) {
      let chartsContext = '\n## 关联命盘信息（上下文注入）\n当用户询问特定人物（如"张三"）或进行关系合盘时，请参考以下信息：\n'
      contextCharts.forEach(profile => {
        if (!profile.birthChart) return
        const { basicInfo, tianpan, dipan, renpan, shenpan } = profile.birthChart.result
        chartsContext += `
### ${profile.name} (${profile.gender === 'male' ? '男' : '女'})
- 出生时间: ${profile.birthChart.result.basicInfo.gongli}
- 四柱: ${basicInfo.sizhu}
- 局数: ${basicInfo.dunju}
- 值符/值使: ${basicInfo.zhifu} / ${basicInfo.zhishi}
- 天盘: ${tianpan.join(', ')}
- 地盘: ${dipan.join(', ')}
- 人盘: ${renpan.join(', ')}
- 神盘: ${shenpan.join(', ')}
`
      })
      systemPrompt += chartsContext
    }

    if (birthChart) {
      const { basicInfo, tianpan, dipan, renpan, shenpan } = birthChart.result
      
      const birthChartContext = `
## 用户命盘信息（终身局）
- 姓名: ${birthChart.input.gender === 'male' ? '男命' : '女命'}
- 出生时间: ${birthChart.result.basicInfo.gongli}
- 四柱: ${basicInfo.sizhu}
- 局数: ${basicInfo.dunju}
- 值符/值使: ${basicInfo.zhifu} / ${basicInfo.zhishi}

### 命盘详情
- 天盘: ${tianpan.join(', ')}
- 地盘: ${dipan.join(', ')}
- 人盘: ${renpan.join(', ')}
- 神盘: ${shenpan.join(', ')}

请在分析时参考用户的命盘信息，特别是当用户询问人生运势、性格特点、长期规划等问题时。
`
      systemPrompt += birthChartContext
    }

    if (qimenReport) {
      const { basicInfo, analysis, suggestions, tianpan, dipan, renpan, shenpan } = qimenReport.result
      
      const qimenContext = `
## 当前排盘信息
- 问题类型: ${qimenReport.input.questionType}
- 排盘时间: ${qimenReport.result.basicInfo.gongli}
- 四柱: ${basicInfo.sizhu}
- 值符/值使: ${basicInfo.zhifu} / ${basicInfo.zhishi}
- 局数: ${basicInfo.dunju}

### 盘面详情
- 天盘(九星): ${tianpan.join(', ')}
- 地盘(三奇六仪): ${dipan.join(', ')}
- 人盘(八门): ${renpan.join(', ')}
- 神盘(八神): ${shenpan.join(', ')}

### 基础分析
${analysis}

### 建议
${suggestions.join('\n')}
`
      systemPrompt += qimenContext
    }
    
    return [
      { role: 'system', content: systemPrompt },
      ...apiMessages,
      { role: 'user', content: newMessage }
    ]
  }

  /**
   * 调用SiliconFlow API
   */
  private static async callSiliconFlowAPI(messages: any[]) {
    const response = await fetch(this.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages,
        model: this.DEFAULT_MODEL
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }
}
