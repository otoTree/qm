import { QimenInput, QimenReport, QimenElements } from '@/types/qimen'
import { QimenAPI } from './qimen-api'
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

    // 准备API调用参数
    const apiInput: QimenInput = {
      ...input,
      year: input.datetime.getFullYear(),
      month: input.datetime.getMonth() + 1,
      day: input.datetime.getDate(),
      hours: input.datetime.getHours(),
      minute: input.datetime.getMinutes(),
      ju_model: input.ju_model || 0,
      pan_model: input.pan_model || 1,
      zhen: input.zhen || 2
    }

    try {
      // 优先调用真实API
      console.log('正在调用真实奇门遁甲API...')
      const apiResponse = await QimenAPI.callQimenAPI(apiInput)
      
      if (apiResponse && apiResponse.errcode === 0) {
        // 处理API响应
        const result = QimenAPI.processApiResponse(apiResponse)
        
        const report: QimenReport = {
          id: nanoid(),
          input: apiInput,
          result,
          timestamp: Date.now()
        }
        
        console.log('真实API调用成功')
        return report
      } else {
        // API调用失败，使用模拟数据
        console.warn('真实API调用失败，使用模拟数据作为备选方案')
        return this.generateMockReport(apiInput)
      }
    } catch (error) {
      console.error('奇门遁甲API调用错误:', error)
      console.warn('由于网络或API错误，使用模拟数据作为备选方案')
      // 出错时使用模拟数据
      return this.generateMockReport(apiInput)
    }
  }

  /**
   * 生成模拟报告（当API不可用时使用）
   */
  private static async generateMockReport(input: QimenInput): Promise<QimenReport> {
    const result = await QimenAPI.mockApiCall(input)
    
    return {
      id: nanoid(),
      input,
      result,
      timestamp: Date.now()
    }
  }

  static validateInput(input: QimenInput): boolean {
    return (
      input.datetime instanceof Date &&
      ['male', 'female'].includes(input.gender) &&
      typeof input.questionType === 'string' &&
      input.questionType.length > 0
    )
  }

  /**
   * 获取当前时间的奇门遁甲输入参数
   */
  static getCurrentTimeInput(questionType: string = 'general', gender: 'male' | 'female' = 'male'): Partial<QimenInput> {
    const now = new Date()
    return {
      datetime: now,
      gender,
      questionType,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hours: now.getHours(),
      minute: now.getMinutes()
    }
  }

  /**
   * 验证时间参数
   */
  static validateDateTime(datetime: Date): boolean {
    const now = new Date()
    const minDate = new Date('1900-01-01')
    const maxDate = new Date(now.getFullYear() + 10, 11, 31) // 未来10年
    
    return datetime >= minDate && datetime <= maxDate
  }

  /**
   * 格式化时间为奇门遁甲所需格式
   */
  static formatDateTime(datetime: Date): string {
    const year = datetime.getFullYear()
    const month = (datetime.getMonth() + 1).toString().padStart(2, '0')
    const day = datetime.getDate().toString().padStart(2, '0')
    const hours = datetime.getHours().toString().padStart(2, '0')
    const minutes = datetime.getMinutes().toString().padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }
}