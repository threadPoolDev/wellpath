import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/constants'

interface Props {
  children: ReactNode
}

export function GuestRoute({ children }: Props) {
  const { user, isInitialized } = useAuthStore()

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    )
  }

  if (user) {
    return <Navigate to={user.onboardingComplete ? ROUTES.DASHBOARD : ROUTES.ONBOARDING} replace />
  }

  return <>{children}</>
}
