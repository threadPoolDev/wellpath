import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/constants'

interface Props {
  children: ReactNode
}

export function ProtectedRoute({ children }: Props) {
  const { user, isInitialized } = useAuthStore()
  const location = useLocation()

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    )
  }

  if (!user) return <Navigate to={ROUTES.LOGIN} replace />

  // Onboarding complete but trying to reach /onboarding via history → dashboard
  if (user.onboardingComplete && location.pathname === ROUTES.ONBOARDING) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  // Onboarding not complete and trying to reach any other protected route → onboarding
  if (!user.onboardingComplete && location.pathname !== ROUTES.ONBOARDING) {
    return <Navigate to={ROUTES.ONBOARDING} replace />
  }

  return <>{children}</>
}
