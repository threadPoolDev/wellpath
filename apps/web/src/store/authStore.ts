import { createAuthStore } from '@wellpath/store'
import { authApi } from '../features/auth/api'

// AuthUser is re-exported so existing web imports still work unchanged.
export type { AuthUser } from '@wellpath/store'

export const useAuthStore = createAuthStore(authApi)
