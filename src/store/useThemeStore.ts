import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  actualTheme: 'light' | 'dark' // 实际应用的主题（解析system后的结果）
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  initializeTheme: () => void
}

// 获取系统主题偏好
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// 应用主题到DOM
const applyTheme = (theme: 'light' | 'dark') => {
  if (typeof document === 'undefined') return
  
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
  
  // 更新meta标签以支持移动端状态栏
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#0a0a0a' : '#ffffff')
  }
}

// 解析主题（将system转换为实际主题）
const resolveTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'system') {
    return getSystemTheme()
  }
  return theme
}

export const useThemeStore = create<ThemeState>()(persist(
  (set, get) => ({
    theme: 'system',
    actualTheme: 'light',
    
    toggleTheme: () => {
      const { theme } = get()
      const themes: Theme[] = ['light', 'dark', 'system']
      const currentIndex = themes.indexOf(theme)
      const nextTheme = themes[(currentIndex + 1) % themes.length]
      set({ theme: nextTheme })
      get().initializeTheme()
    },
    
    setTheme: (theme: Theme) => {
      set({ theme })
      get().initializeTheme()
    },
    
    initializeTheme: () => {
      const { theme } = get()
      let actualTheme: 'light' | 'dark'
      
      if (theme === 'system') {
        actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      } else {
        actualTheme = theme
      }
      
      set({ actualTheme })
      
      // Apply theme to document
      const root = document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(actualTheme)
    },
  }),
  {
    name: 'qimen-theme-store',
    version: 1,
  }
))

// Helper functions
export const getThemeIcon = (theme: Theme): string => {
  switch (theme) {
    case 'light':
      return 'sun'
    case 'dark':
      return 'moon'
    case 'system':
      return 'monitor'
    default:
      return 'monitor'
  }
}

export const getThemeLabel = (theme: Theme): string => {
  switch (theme) {
    case 'light':
      return '浅色模式'
    case 'dark':
      return '深色模式'
    case 'system':
      return '跟随系统'
    default:
      return '跟随系统'
  }
}

// 选择器函数
export const selectTheme = (state: ThemeState) => state.theme
export const selectActualTheme = (state: ThemeState) => state.actualTheme
export const selectIsSystemTheme = (state: ThemeState) => state.theme === 'system'
export const selectIsDarkMode = (state: ThemeState) => state.actualTheme === 'dark'

// React Hook for theme initialization
export const useThemeInitialization = () => {
  const initializeTheme = useThemeStore(state => state.initializeTheme)
  
  // 在组件挂载时初始化主题
  React.useEffect(() => {
    const cleanup = initializeTheme()
    return cleanup
  }, [])
}

// 为了避免React导入错误，使用动态导入
let React: any
if (typeof window !== 'undefined') {
  React = require('react')
}