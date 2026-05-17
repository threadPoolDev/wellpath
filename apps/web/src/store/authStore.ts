import { create } from 'zustand'
import { authApi } from '../features/auth/api'

export interface AuthUser {
  id: string
  email: string
  name: string
  onboardingComplete: boolean
  profilePhoto: { url: string; thumbnailUrl: string } | null
}

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isInitialized: boolean
  setUser: (user: AuthUser | null) => void
  initialize: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  setUser: (user) => set({ user }),

  initialize: async () => {
    set({ isLoading: true })
    try {
      const user = await authApi.getMe()
      set({ user, isInitialized: true })
    } catch {
      set({ user: null, isInitialized: true })
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    try {
      await authApi.logout()
    } finally {
      set({ user: null, isInitialized: true })
    }
  },
}))
