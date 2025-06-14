import { QimenInput, QimenApiResponse, QimenReport, QimenResult } from '@/types/qimen'
import { nanoid } from 'nanoid'

/**
 * 奇门遁甲API服务类
 * 基于原Python代码转换而来
 */
export class QimenAPI {
  private static readonly API_URL = '/api/qimen/qimendunjia'
  private static readonly API_KEY = process.env.NEXT_PUBLIC_QIMEN_API_KEY || 'hMeVwbq9uYR2G2kgM0yZgT0A5'

  /**
   * 调用奇门遁甲排盘API
   */
  static async callQimenAPI(input: QimenInput): Promise<QimenApiResponse | null> {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    // 构建请求数据
    const formData = new URLSearchParams({
      api_key: this.API_KEY,
      name: '用户', // 默认姓名
      sex: input.gender === 'male' ? '0' : '1',
      type: '1', // 默认公历
      year: input.year.toString(),
      month: input.month.toString(),
      day: input.day.toString(),
      hours: input.hours.toString(),
      minute: input.minute.toString(),
      ju_model: (input.ju_model || 0).toString(),
      pan_model: (input.pan_model || 1).toString(),
      zhen: (input.zhen || 2).toString()
    })

    // 处理可选参数
    if (input.fei_pan_model !== undefined && input.pan_model === 0) {
      formData.append('fei_pan_model', input.fei_pan_model.toString())
    }

    if (input.zhen === 1) {
      if (!input.province || !input.city) {
        throw new Error('使用真太阳时必须提供省市信息')
      }
      formData.append('province', input.province)
      formData.append('city', input.city)
    }

    try {
      console.log('发送API请求到:', this.API_URL)
      console.log('请求参数:', Object.fromEntries(formData.entries()))
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers,
        body: formData
      })

      console.log('API响应状态:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API响应错误:', errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const responseText = await response.text()
      console.log('API原始响应:', responseText)
      
      let result: QimenApiResponse
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error('JSON解析失败:', parseError)
        throw new Error(`Invalid JSON response: ${responseText}`)
      }
      
      console.log('API解析结果:', result)
      
      if (result.errcode !== 0) {
        console.error('API业务错误:', result.errmsg)
        throw new Error(`API error: ${result.errmsg}`)
      }

      return result
    } catch (error) {
      console.error('奇门遁甲API请求失败:', error)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('网络连接失败，可能是CORS问题或网络不可达')
      }
      return null
    }
  }

  /**
   * 处理API响应数据，转换为应用所需格式
   */
  static processApiResponse(apiResponse: QimenApiResponse): QimenResult {
    const data = apiResponse.data
    const gongOrder = ['坎', '艮', '震', '巽', '离', '坤', '兑', '乾', '中']
    
    console.log('处理API响应数据:', data)
    
    // 提取九宫数据
    const tianpan: string[] = []
    const dipan: string[] = []
    const renpan: string[] = []
    const shenpan: string[] = []
    
    // 确保gong_pan存在且为数组
    if (!data.gong_pan || !Array.isArray(data.gong_pan)) {
      console.error('API响应中缺少gong_pan数据或格式不正确')
      throw new Error('API响应数据格式错误：缺少九宫数据')
    }
    
    data.gong_pan.forEach((pan, index) => {
      try {
        tianpan.push(`${pan.tianpan?.jiuxing || ''}${pan.tianpan?.sanqiliuyi || ''}`)
        dipan.push(pan.dipan?.sanqiliuyi || '')
        renpan.push(pan.renpan?.bamen || '')
        shenpan.push(pan.shenpan?.bashen || '无')
      } catch (error) {
        console.error(`处理第${index}宫数据时出错:`, error, pan)
        tianpan.push('数据错误')
        dipan.push('数据错误')
        renpan.push('数据错误')
        shenpan.push('数据错误')
      }
    })

    // 生成详细信息文本
    const detailedInfo = this.generateDetailedInfo(data)
    
    // 生成分析结果
    const analysis = this.generateAnalysis(data)
    
    // 生成建议
    const suggestions = this.generateSuggestions(data)

    return {
      tianpan,
      dipan,
      renpan,
      shenpan,
      analysis,
      suggestions,
      basicInfo: {
        gongli: data.gongli || '公历时间获取失败',
        nongli: data.nongli || '农历时间获取失败',
        sizhu: data.sizhu_info ? 
          `${data.sizhu_info.year_gan || ''}${data.sizhu_info.year_zhi || ''} ${data.sizhu_info.month_gan || ''}${data.sizhu_info.month_zhi || ''} ${data.sizhu_info.day_gan || ''}${data.sizhu_info.day_zhi || ''} ${data.sizhu_info.hour_gan || ''}${data.sizhu_info.hour_zhi || ''}` : 
          '四柱信息获取失败',
        zhifu: data.zhifu_info ? 
          `${data.zhifu_info.zhifu_name || ''}星（落${data.zhifu_info.zhifu_luogong || ''}宫）` : 
          '值符信息获取失败',
        zhishi: data.zhifu_info ? 
          `${data.zhifu_info.zhishi_name || ''}（落${data.zhifu_info.zhishi_luogong || ''}宫）` : 
          '值使信息获取失败',
        dunju: `${data.dunju || '遁局获取失败'}（${data.dingju || '定局获取失败'}）`
      },
      detailedInfo
    }
  }

  /**
   * 生成详细信息文本（基于原Python info函数）
   */
  private static generateDetailedInfo(data: any): string {
    const gongOrder = ['坎', '艮', '震', '巽', '离', '坤', '兑', '乾', '中']
    
    try {
      let text = `════════ 基础信息 ════════\n`
      text += `公历时间：${data.gongli || '获取失败'}\n`
      text += `农历时间：${data.nongli || '获取失败'}\n\n`
      
      if (data.sizhu_info) {
        text += `────── 四柱信息 ──────\n`
        text += `年柱：${data.sizhu_info.year_gan || ''}${data.sizhu_info.year_zhi || ''}\n`
        text += `月柱：${data.sizhu_info.month_gan || ''}${data.sizhu_info.month_zhi || ''}\n`
        text += `日柱：${data.sizhu_info.day_gan || ''}${data.sizhu_info.day_zhi || ''}\n`
        text += `时柱：${data.sizhu_info.hour_gan || ''}${data.sizhu_info.hour_zhi || ''}\n\n`
      }
      
      if (data.xunkong_info) {
        text += `────── 旬空信息 ──────\n`
        text += `年柱旬空：${data.xunkong_info.year_xunkong || '获取失败'}\n`
        text += `月柱旬空：${data.xunkong_info.month_xunkong || '获取失败'}\n`
        text += `日柱旬空：${data.xunkong_info.day_xunkong || '获取失败'}\n`
        text += `时柱旬空：${data.xunkong_info.hour_xunkong || '获取失败'}\n\n`
      }
      
      text += `────── 奇门遁甲信息 ──────\n`
      if (data.zhifu_info) {
        text += `值符：${data.zhifu_info.zhifu_name || '获取失败'}星（落${data.zhifu_info.zhifu_luogong || ''}宫）\n`
        text += `值使：${data.zhifu_info.zhishi_name || '获取失败'}（落${data.zhifu_info.zhishi_luogong || ''}宫）\n`
      }
      text += `符首：${data.fushou || '获取失败'}\n`
      text += `旬首：${data.xunshou || '获取失败'}\n`
      text += `遁局：${data.dunju || '获取失败'}（${data.dingju || '获取失败'}）\n`
      text += `盘类：${data.panlei || '获取失败'}\n\n`
      
      text += `────── 节气信息 ──────\n`
      text += `上一节气：${data.jieqi_pre || '获取失败'}\n`
      text += `下一节气：${data.jieqi_next || '获取失败'}\n\n`
      
      text += `════════ 奇门遁甲宫盘分析 ════════\n`
      
      if (data.gong_pan && Array.isArray(data.gong_pan)) {
        data.gong_pan.forEach((pan: any, i: number) => {
          try {
            const gongName = gongOrder[i] || `第${i+1}宫`
            text += `────── ${gongName}宫 ──────\n`
            text += `【神盘】${pan.shenpan?.bashen || '无'}\n`
            text += `【天盘】九星：${pan.tianpan?.jiuxing || '获取失败'} | 三奇六仪：${pan.tianpan?.sanqiliuyi || '获取失败'}\n`
            text += `【地盘】三奇六仪：${pan.dipan?.sanqiliuyi || '获取失败'}\n`
            text += `【人盘】八门：${pan.renpan?.bamen || '获取失败'}\n`
            if (pan.description) {
              text += `◎ 宫局状态：${pan.description.gong_ju || '获取失败'}\n`
              text += `◎ 详细解读：${pan.description.luo_gong_desc || '获取失败'}\n\n`
            } else {
              text += `◎ 详细解读：数据获取失败\n\n`
            }
          } catch (error) {
            console.error(`处理第${i}宫详细信息时出错:`, error)
            text += `────── 第${i+1}宫 ──────\n`
            text += `数据处理出错\n\n`
          }
        })
      } else {
        text += `九宫数据获取失败\n`
      }
      
      return text
    } catch (error) {
      console.error('生成详细信息时出错:', error)
      return `详细信息生成失败：${error instanceof Error ? error.message : '未知错误'}`
    }
  }

  /**
   * 生成分析结果
   */
  private static generateAnalysis(data: any): string {
    try {
      const zhifuGong = data.zhifu_info?.zhifu_luogong || '未知'
      const zhishiGong = data.zhifu_info?.zhishi_luogong || '未知'
      const dunju = data.dunju || '未知局'
      
      let analysis = `根据当前时局的奇门遁甲排盘分析：\n\n`
      
      if (data.zhifu_info) {
        analysis += `本局为${dunju}，值符${data.zhifu_info.zhifu_name || '未知'}星落${zhifuGong}宫，值使${data.zhifu_info.zhishi_name || '未知'}落${zhishiGong}宫。\n\n`
      } else {
        analysis += `本局为${dunju}，值符值使信息获取失败。\n\n`
      }
      
      // 分析主要宫位
      if (data.gong_pan && Array.isArray(data.gong_pan)) {
        const importantGongs = ['乾', '坤', '离', '坎']
        importantGongs.forEach(gongName => {
          const gongIndex = ['坎', '艮', '震', '巽', '离', '坤', '兑', '乾', '中'].indexOf(gongName)
          if (gongIndex !== -1 && data.gong_pan[gongIndex]) {
            const pan = data.gong_pan[gongIndex]
            analysis += `${gongName}宫：${pan.tianpan?.jiuxing || '未知'}星配${pan.renpan?.bamen || '未知'}，${pan.description?.gong_ju || '未知状态'}。${pan.description?.luo_gong_desc || '解读获取失败'}\n\n`
          }
        })
      } else {
        analysis += `九宫数据获取失败，无法进行详细分析。\n\n`
      }
      
      return analysis
    } catch (error) {
      console.error('生成分析时出错:', error)
      return `分析生成失败：${error instanceof Error ? error.message : '未知错误'}`
    }
  }

  /**
   * 生成建议
   */
  private static generateSuggestions(data: any): string[] {
    const suggestions: string[] = []
    
    try {
      // 基于值符值使给出建议
      if (data.zhifu_info) {
        const zhifuGong = data.zhifu_info.zhifu_luogong || '未知'
        const zhishiGong = data.zhifu_info.zhishi_luogong || '未知'
        
        suggestions.push(`当前值符落${zhifuGong}宫，建议重点关注此方位的事务发展`)
        suggestions.push(`值使落${zhishiGong}宫，在此方位行事较为有利`)
      } else {
        suggestions.push('值符值使信息获取失败，建议谨慎行事')
      }
      
      // 基于遁局给出建议
      if (data.dunju) {
        if (data.dunju.includes('阳')) {
          suggestions.push('当前为阳遁局，适合主动出击，积极行动')
        } else if (data.dunju.includes('阴')) {
          suggestions.push('当前为阴遁局，宜静观其变，谨慎行事')
        } else {
          suggestions.push('遁局信息不明确，建议保持平衡心态')
        }
      } else {
        suggestions.push('遁局信息获取失败，建议保持谨慎')
      }
      
      // 基于节气给出建议
      suggestions.push(`当前节气环境下，建议顺应自然规律，把握时机`)
      
      // 如果没有任何建议，添加默认建议
      if (suggestions.length === 0) {
        suggestions.push('数据获取不完整，建议稍后重试或咨询专业人士')
      }
      
      return suggestions
    } catch (error) {
      console.error('生成建议时出错:', error)
      return ['建议生成失败，请稍后重试']
    }
  }

  /**
   * 模拟API调用（用于开发测试）
   */
  static async mockApiCall(input: QimenInput): Promise<QimenResult> {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 返回模拟数据
    return {
      tianpan: ['天蓬甲', '天芮乙', '天冲丙', '天辅丁', '天禽戊', '天心己', '天柱庚', '天任辛', '天英壬'],
      dipan: ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'],
      renpan: ['休门', '死门', '伤门', '杜门', '开门', '惊门', '生门', '景门', '中宫'],
      shenpan: ['值符', '腾蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天', '无'],
      analysis: `根据您提供的时间进行奇门遁甲排盘分析：\n\n当前时局显示为模拟数据，实际使用时将调用真实API获取准确的排盘结果。\n\n请注意这是开发测试版本，正式使用前请配置正确的API密钥。`,
      suggestions: [
        '这是模拟建议1：建议在吉时进行重要决策',
        '这是模拟建议2：注意避开不利的方位和时间',
        '这是模拟建议3：可以考虑佩戴相应的吉祥物品',
        '这是模拟建议4：保持积极的心态和行动'
      ],
      basicInfo: {
        gongli: `${input.year}-${input.month.toString().padStart(2, '0')}-${input.day.toString().padStart(2, '0')} ${input.hours.toString().padStart(2, '0')}:${input.minute.toString().padStart(2, '0')}`,
        nongli: '农历时间（模拟）',
        sizhu: '四柱信息（模拟）',
        zhifu: '值符信息（模拟）',
        zhishi: '值使信息（模拟）',
        dunju: '遁局信息（模拟）'
      },
      detailedInfo: '这是模拟的详细信息，实际使用时将显示完整的奇门遁甲分析内容。'
    }
  }
}