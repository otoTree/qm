import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { QimenReport, QimenInput } from '@/types/qimen'
import { QimenCalculator } from '@/lib/qimen-calculator'

export interface UserProfile {
  name: string
  gender: 'male' | 'female'
  birthDate: Date | null
  birthChart: QimenReport | null
}

interface UserState {
  profile: UserProfile
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
  updateProfile: (profile: Partial<UserProfile>) => void
  generateBirthChart: () => Promise<void>
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: {
        name: '用户',
        gender: 'male',
        birthDate: null,
        birthChart: null,
      },
      isOpen: false,
      setOpen: (isOpen: boolean) => set({ isOpen }),
      updateProfile: (newProfile: Partial<UserProfile>) => 
        set((state) => ({
          profile: { ...state.profile, ...newProfile }
        })),
      generateBirthChart: async () => {
        const { profile } = get()
        if (!profile.birthDate) return

        const birthDate = new Date(profile.birthDate)
        const input: QimenInput = {
          datetime: birthDate,
          year: birthDate.getFullYear(),
          month: birthDate.getMonth() + 1,
          day: birthDate.getDate(),
          hours: birthDate.getHours(),
          minute: birthDate.getMinutes(),
          gender: profile.gender,
          questionType: '命盘', // Special type for birth chart
          ju_model: 0, // Default to Zhirun (Split)
          pan_model: 1, // Default to Paipan (Plate)
          zhen: 2, // Default to PingTai (Platform time)
        }

        try {
          const report = await QimenCalculator.calculate(input)
          set((state) => ({
            profile: { ...state.profile, birthChart: report }
          }))
        } catch (error) {
          console.error('Failed to generate birth chart:', error)
        }
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ profile: state.profile }), // Only persist profile
    }
  )
)
