// Platform-agnostic auth store factory.
// Each platform (web, mobile) calls createAuthStore(theirAuthApi) to get a
// Zustand store bound to their platform's auth implementation.
//
// Web:   authApi uses axios + httpOnly cookies
// Mobile: authApi uses fetch + Expo SecureStore Bearer token (PR #M2)

import { create } from 'zustand'
import type { AuthUser } from '@wellpath/types'

export type { AuthUser }

export interface AuthApi {
  getMe(): Promise<AuthUser>
  logout(): Promise<void>
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isInitialized: boolean
  setUser: (user: AuthUser | null) => void
  initialize: () => Promise<void>
  logout: () => Promise<void>
}

export function createAuthStore(authApi: AuthApi) {
  return create<AuthState>((set) => ({
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
}
