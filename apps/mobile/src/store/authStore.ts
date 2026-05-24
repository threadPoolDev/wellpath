import { createAuthStore } from '@wellpath/store'
import { mobileAuthApi } from '../features/auth/api'

export type { AuthUser } from '@wellpath/store'

export const useAuthStore = createAuthStore({
  getMe: mobileAuthApi.getMe,
  logout: mobileAuthApi.logout,
})
