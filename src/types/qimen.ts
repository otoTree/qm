// 奇门遁甲相关类型定义
export interface QimenInput {
  datetime: Date
  gender: 'male' | 'female'
  questionType: string
  question?: string
  // API 参数
  year: number
  month: number
  day: number
  hours: number
  minute: number
  ju_model?: number  // 起局方法 (0拆补法, 1置闰法, 2茅山道人法, 默认0)
  pan_model?: number // 盘类型 (0飞盘奇门, 1转盘奇门, 默认1)
  fei_pan_model?: number // 飞盘排法 (1全部顺排, 2阴顺阳逆, pan_model=0时必传)
  zhen?: number      // 真太阳时 (1考虑, 2不考虑, 默认2)
  province?: string  // 省份 (zhen=1时必传)
  city?: string      // 城市 (zhen=1时必传)
}

// 四柱信息
export interface SizhuInfo {
  year_gan: string
  year_zhi: string
  month_gan: string
  month_zhi: string
  day_gan: string
  day_zhi: string
  hour_gan: string
  hour_zhi: string
}

// 旬空信息
export interface XunkongInfo {
  year_xunkong: string
  month_xunkong: string
  day_xunkong: string
  hour_xunkong: string
}

// 值符值使信息
export interface ZhifuInfo {
  zhifu_name: string
  zhifu_luogong: string
  zhishi_name: string
  zhishi_luogong: string
}

// 宫盘信息
export interface GongPan {
  shenpan: {
    bashen: string | null
  }
  tianpan: {
    jiuxing: string
    sanqiliuyi: string
  }
  dipan: {
    sanqiliuyi: string
  }
  renpan: {
    bamen: string
  }
  description: {
    gong_ju: string
    luo_gong_desc: string
  }
}

// API 响应数据结构
export interface QimenApiResponse {
  errcode: number
  errmsg: string
  notice: string
  data: {
    gongli: string
    nongli: string
    sizhu_info: SizhuInfo
    xunkong_info: XunkongInfo
    zhifu_info: ZhifuInfo
    fushou: string
    xunshou: string
    dunju: string
    dingju: string
    panlei: string
    jieqi_pre: string
    jieqi_next: string
    gong_pan: GongPan[]
  }
}

// 处理后的奇门遁甲结果
export interface QimenResult {
  tianpan: string[]    // 天盘 9宫格
  dipan: string[]      // 地盘 9宫格
  renpan: string[]     // 人盘 9宫格
  shenpan: string[]    // 神盘 9宫格
  analysis: string     // 分析结果
  suggestions: string[] // 建议列表
  basicInfo: {
    gongli: string
    nongli: string
    sizhu: string
    zhifu: string
    zhishi: string
    dunju: string
  }
  detailedInfo: string // 详细解读文本
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

// 问题类型配置
export const QUESTION_TYPES = {
  general: '综合运势',
  career: '事业财运',
  relationship: '感情婚姻',
  health: '健康状况',
  study: '学业考试'
} as const

export type QuestionType = keyof typeof QUESTION_TYPES