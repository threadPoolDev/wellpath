import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/constants'

export function AuthCallback() {
  const navigate = useNavigate()
  const { initialize, user } = useAuthStore()

  useEffect(() => {
    initialize().then(() => {
      const currentUser = useAuthStore.getState().user
      if (!currentUser) {
        navigate(`${ROUTES.LOGIN}?error=oauth_failed`, { replace: true })
        return
      }
      navigate(currentUser.onboardingComplete ? ROUTES.DASHBOARD : ROUTES.ONBOARDING, {
        replace: true,
      })
    })
  // initialize is stable — safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  if (user) return null

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      <p className="text-sm text-muted-foreground">Finishing sign-in…</p>
    </div>
  )
}
