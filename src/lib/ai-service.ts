import { QimenReport } from '@/types/qimen'
import { nanoid } from 'nanoid'
import { ChatMessage, MessageRole } from '@/types/chatmessage'

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
67| 作为奇门遁甲排盘分析师，你必须遵守上述Rules，按照Workflows执行任务。`

  /**
   * 发送消息到AI并获取回复
   */
  static async sendMessage(
    message: string,
    conversationHistory: ChatMessage[] = [],
    qimenReport?: QimenReport
  ): Promise<ChatMessage> {
    try {
      // 构建消息数组
      const messages = this.buildMessages(conversationHistory, message, qimenReport)
      
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
   * 调用SiliconFlow API (via Backend)
   */
  private static async callSiliconFlowAPI(messages: any[]): Promise<string> {
    const response = await fetch(this.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.DEFAULT_MODEL,
        messages: messages
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`AI Service API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    // The backend returns the standard OpenAI format or our proxy format.
    // Our backend returns `data` directly from SiliconFlow.
    return data.choices[0]?.message?.content || '抱歉，我无法生成回复。'
  }

  /**
   * 构建消息数组（OpenAI格式）
   */
  private static buildMessages(
    conversationHistory: ChatMessage[],
    currentMessage: string,
    qimenReport?: QimenReport
  ): any[] {
    const messages = []
    
    // 添加系统消息
    let systemContent = this.SYSTEM_PROMPT
    
    // 添加奇门遁甲报告信息到系统消息
    if (qimenReport) {
      systemContent += '\n\n' + this.formatQimenReport(qimenReport)
    }
    
    messages.push({
      role: 'system',
      content: systemContent
    })
    
    // 添加对话历史（最近10条）
    const recentHistory = conversationHistory.slice(-10)
    recentHistory.forEach(msg => {
      if (msg.role !== 'system') {
        messages.push({
          role: msg.role,
          content: msg.content
        })
      }
    })
    
    // 添加当前用户消息
    messages.push({
      role: 'user',
      content: currentMessage
    })
    
    return messages
  }

  /**
   * 获取系统提示
   */
  static getSystemPrompt(): string {
    return this.SYSTEM_PROMPT
  }

  /**
   * 验证API配置
   */
  static validateConfig(): boolean {
    return true
  }

  /**
   * 获取API状态信息
   */
  static getAPIStatus(): { configured: boolean; model: string; baseUrl: string } {
    return {
      configured: true,
      model: this.DEFAULT_MODEL,
      baseUrl: this.API_ENDPOINT
    }
  }

  /**
   * 格式化奇门遁甲排盘报告
   * 按照标准格式组织排盘信息
   */
  private static formatQimenReport(qimenReport: QimenReport): string {
    // 从API响应数据中提取信息，需要先检查数据结构
    const data = (qimenReport as any).apiData || qimenReport.result
    
    let text = `
════════ 基础信息 ════════
`
    text += `公历时间：${qimenReport.result.basicInfo.gongli}\n`
    
    // 如果有农历信息
    if (data.nongli) {
      text += `农历时间：${data.nongli}\n`
    }
    
    text += `\n────── 四柱信息 ──────\n`
    
    // 如果有详细的四柱信息
    if (data.sizhu_info) {
      text += `年柱：${data.sizhu_info.year_gan}${data.sizhu_info.year_zhi}\n`
      text += `月柱：${data.sizhu_info.month_gan}${data.sizhu_info.month_zhi}\n`
      text += `日柱：${data.sizhu_info.day_gan}${data.sizhu_info.day_zhi}\n`
      text += `时柱：${data.sizhu_info.hour_gan}${data.sizhu_info.hour_zhi}\n`
    } else {
      text += `四柱：${qimenReport.result.basicInfo.sizhu}\n`
    }
    
    // 旬空信息
    if (data.xunkong_info) {
      text += `\n────── 旬空信息 ──────\n`
      text += `年柱旬空：${data.xunkong_info.year_xunkong}\n`
      text += `月柱旬空：${data.xunkong_info.month_xunkong}\n`
      text += `日柱旬空：${data.xunkong_info.day_xunkong}\n`
      text += `时柱旬空：${data.xunkong_info.hour_xunkong}\n`
    }
    
    text += `\n────── 奇门遁甲信息 ──────\n`
    
    // 值符值使信息
    if (data.zhifu_info) {
      text += `值符：${data.zhifu_info.zhifu_name}星（落${data.zhifu_info.zhifu_luogong}宫）\n`
      text += `值使：${data.zhifu_info.zhishi_name}（落${data.zhifu_info.zhishi_luogong}宫）\n`
    } else {
      text += `值符：${qimenReport.result.basicInfo.zhifu}\n`
      text += `值使：${qimenReport.result.basicInfo.zhishi}\n`
    }
    
    // 其他基础信息
    if (data.fushou) text += `符首：${data.fushou}\n`
    if (data.xunshou) text += `旬首：${data.xunshou}\n`
    
    text += `遁局：${qimenReport.result.basicInfo.dunju}`
    if (data.dingju) text += `（${data.dingju}）`
    text += `\n`
    
    if (data.panlei) text += `盘类：${data.panlei}\n`
    
    // 节气信息
    if (data.jieqi_pre || data.jieqi_next) {
      text += `\n────── 节气信息 ──────\n`
      if (data.jieqi_pre) text += `上一节气：${data.jieqi_pre}\n`
      if (data.jieqi_next) text += `下一节气：${data.jieqi_next}\n`
    }
    
    // 宫盘分析
    if (data.gong_pan && Array.isArray(data.gong_pan)) {
      const gongOrder = ["坎", "艮", "震", "巽", "离", "坤", "兑", "乾", "中"]
      
      text += `\n════════ 奇门遁甲宫盘分析 ════════`
      
      data.gong_pan.forEach((pan: any, index: number) => {
        const gongName = gongOrder[index] || `第${index + 1}宫`
        text += `\n────── ${gongName}宫 ──────`
        
        // 神盘
        const bashen = pan.shenpan?.bashen || '无'
        text += `\n【神盘】${bashen}`
        
        // 天盘
        const jiuxing = pan.tianpan?.jiuxing || ''
        const tianpanSanqi = pan.tianpan?.sanqiliuyi || ''
        text += `\n【天盘】九星：${jiuxing} | 三奇六仪：${tianpanSanqi}`
        
        // 地盘
        const dipanSanqi = pan.dipan?.sanqiliuyi || ''
        text += `\n【地盘】三奇六仪：${dipanSanqi}`
        
        // 人盘
        const bamen = pan.renpan?.bamen || ''
        text += `\n【人盘】八门：${bamen}`
        
        // 描述信息
        if (pan.description) {
          if (pan.description.gong_ju) {
            text += `\n◎ 宫局状态：${pan.description.gong_ju}`
          }
          if (pan.description.luo_gong_desc) {
            text += `\n◎ 详细解读：${pan.description.luo_gong_desc}`
          }
        }
      })
    }
    
    // 添加问题类型
    text += `\n\n════════ 问卜信息 ════════\n`
    text += `问题类型：${qimenReport.input.questionType}\n`
    if (qimenReport.input.question) {
      text += `具体问题：${qimenReport.input.question}\n`
    }
    
    // 添加详细分析
    if (qimenReport.result.analysis) {
      text += `\n════════ 排盘分析 ════════\n`
      text += qimenReport.result.analysis + '\n'
    }
    
    // 添加建议
    if (qimenReport.result.suggestions && qimenReport.result.suggestions.length > 0) {
      text += `\n════════ 初步建议 ════════\n`
      qimenReport.result.suggestions.forEach((suggestion, index) => {
        text += `${index + 1}. ${suggestion}\n`
      })
    }
    
    return text
  }
}
