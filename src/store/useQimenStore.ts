import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { QimenInput, QimenReport } from '@/types/qimen'
import { QimenCalculator } from '@/lib/qimen-calculator'

interface QimenState {
  currentReport: QimenReport | null
  reports: QimenReport[]
  isGenerating: boolean
  error: string | null
  generateReport: (input: QimenInput) => Promise<void>
  setCurrentReport: (report: QimenReport | null) => void
  clearCurrentReport: () => void
  getReportById: (id: string) => QimenReport | undefined
  deleteReport: (id: string) => void
  clearError: () => void
}

export const useQimenStore = create<QimenState>()(
  persist(
    (set, get) => ({
      currentReport: null,
      reports: [],
      isGenerating: false,
      error: null,

      generateReport: async (input: QimenInput) => {
        set({ isGenerating: true, error: null })
        try {
          const report = await QimenCalculator.calculate(input)
          set((state: QimenState) => ({
            currentReport: report,
            reports: [report, ...state.reports.slice(0, 49)], // 保留最近50个报告
            isGenerating: false,
            error: null
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '生成报告时发生未知错误'
          console.error('Generate report error:', error)
          set({ 
            isGenerating: false, 
            error: errorMessage
          })
        }
      },

      setCurrentReport: (report: QimenReport | null) => set({ currentReport: report }),
      
      clearCurrentReport: () => set({ currentReport: null }),
      
      getReportById: (id: string) => {
        return get().reports.find((report: QimenReport) => report.id === id)
      },

      deleteReport: (id: string) => {
        set((state: QimenState) => {
          const newReports = state.reports.filter((report: QimenReport) => report.id !== id)
          const newCurrentReport = state.currentReport?.id === id ? null : state.currentReport
          return {
            reports: newReports,
            currentReport: newCurrentReport
          }
        })
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'qimen-storage',
      partialize: (state: QimenState) => ({
        reports: state.reports
        // 不持久化 currentReport，页面刷新后重置
      }),
      // 版本控制，用于数据迁移
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // 从版本0迁移到版本1的逻辑
          return {
            ...persistedState,
            error: null
          }
        }
        return persistedState
      },
      // 页面刷新后重置当前报告
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.currentReport = null
        }
      }
    }
  )
)

// 选择器函数，用于优化性能
export const useCurrentReport = () => useQimenStore((state: QimenState) => state.currentReport)
export const useReports = () => useQimenStore((state: QimenState) => state.reports)
export const useIsGenerating = () => useQimenStore((state: QimenState) => state.isGenerating)
export const useQimenError = () => useQimenStore((state: QimenState) => state.error)

// 工具函数
export const getReportSummary = (report: QimenReport) => {
  const { basicInfo, analysis } = report.result
  return {
    id: report.id,
    title: `${basicInfo.gongli} - ${report.input.questionType}`,
    preview: analysis.slice(0, 100) + '...',
    timestamp: report.timestamp
  }
}