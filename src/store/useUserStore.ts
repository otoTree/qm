import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { QimenReport, QimenInput } from '@/types/qimen'
import { QimenCalculator } from '@/lib/qimen-calculator'
import { nanoid } from 'nanoid'

export interface UserProfile {
  name: string
  gender: 'male' | 'female'
  birthDate: Date | null
  birthChart: QimenReport | null
}

export interface PersonProfile {
  id: string
  name: string
  gender: 'male' | 'female'
  birthDate: Date
  birthChart: QimenReport | null
  relationship?: string
  notes?: string
}

interface UserState {
  profile: UserProfile
  savedProfiles: PersonProfile[]
  isOpen: boolean
  isChartManagerOpen: boolean
  setOpen: (isOpen: boolean) => void
  setChartManagerOpen: (isOpen: boolean) => void
  updateProfile: (profile: Partial<UserProfile>) => void
  generateBirthChart: () => Promise<void>
  
  // New methods for managing multiple profiles
  addSavedProfile: (profile: Omit<PersonProfile, 'id' | 'birthChart'>) => Promise<void>
  removeSavedProfile: (id: string) => void
  updateSavedProfile: (id: string, updates: Partial<PersonProfile>) => void
  generateProfileChart: (id: string) => Promise<void>
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
      savedProfiles: [],
      isOpen: false,
      isChartManagerOpen: false,
      setOpen: (isOpen: boolean) => set({ isOpen }),
      setChartManagerOpen: (isOpen: boolean) => set({ isChartManagerOpen: isOpen }),
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
      },

      addSavedProfile: async (profileInput) => {
        const newProfile: PersonProfile = {
          ...profileInput,
          id: nanoid(),
          birthChart: null
        }
        
        // Auto generate chart
        const birthDate = new Date(newProfile.birthDate)
        const input: QimenInput = {
          datetime: birthDate,
          year: birthDate.getFullYear(),
          month: birthDate.getMonth() + 1,
          day: birthDate.getDate(),
          hours: birthDate.getHours(),
          minute: birthDate.getMinutes(),
          gender: newProfile.gender,
          questionType: '命盘',
          ju_model: 0,
          pan_model: 1,
          zhen: 2,
        }

        try {
          const report = await QimenCalculator.calculate(input)
          newProfile.birthChart = report
        } catch (error) {
          console.error('Failed to generate chart for new profile:', error)
        }

        set((state) => ({
          savedProfiles: [...state.savedProfiles, newProfile]
        }))
      },

      removeSavedProfile: (id) => 
        set((state) => ({
          savedProfiles: state.savedProfiles.filter(p => p.id !== id)
        })),

      updateSavedProfile: (id, updates) =>
        set((state) => ({
          savedProfiles: state.savedProfiles.map(p => 
            p.id === id ? { ...p, ...updates } : p
          )
        })),

      generateProfileChart: async (id) => {
        const { savedProfiles } = get()
        const profile = savedProfiles.find(p => p.id === id)
        if (!profile) return

        const birthDate = new Date(profile.birthDate)
        const input: QimenInput = {
          datetime: birthDate,
          year: birthDate.getFullYear(),
          month: birthDate.getMonth() + 1,
          day: birthDate.getDate(),
          hours: birthDate.getHours(),
          minute: birthDate.getMinutes(),
          gender: profile.gender,
          questionType: '命盘',
          ju_model: 0,
          pan_model: 1,
          zhen: 2,
        }

        try {
          const report = await QimenCalculator.calculate(input)
          set((state) => ({
            savedProfiles: state.savedProfiles.map(p => 
              p.id === id ? { ...p, birthChart: report } : p
            )
          }))
        } catch (error) {
          console.error('Failed to generate chart for profile:', error)
        }
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ 
        profile: state.profile,
        savedProfiles: state.savedProfiles 
      }), 
    }
  )
)
