import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/constants'
import { LoginPage } from '@/features/auth/components/LoginPage'
import { RegisterPage } from '@/features/auth/components/RegisterPage'
import { AuthCallback } from '@/features/auth/components/AuthCallback'
import { GuestRoute } from '@/features/auth/components/GuestRoute'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { OnboardingFlow } from '@/features/onboarding/OnboardingFlow'

const queryClient = new QueryClient()

function AppRoutes() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  // Re-run auth check when the browser restores a page from the back-forward cache.
  // Without this, bfcache snapshots bypass GuestRoute and ProtectedRoute entirely.
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) initialize()
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [initialize])

  return (
    <Routes>
      {/* Guest-only routes — redirect authenticated users away */}
      <Route path={ROUTES.LOGIN} element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path={ROUTES.REGISTER} element={<GuestRoute><RegisterPage /></GuestRoute>} />

      {/* OAuth callback — handled by AuthCallback which navigates after /me */}
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Onboarding — requires auth, redirects to dashboard if already complete */}
      <Route path={ROUTES.ONBOARDING} element={<ProtectedRoute><OnboardingFlow /></ProtectedRoute>} />

      {/* Protected routes */}
      <Route
        path={ROUTES.DASHBOARD}
        element={<ProtectedRoute><div className="p-8">Dashboard — coming in PR #10</div></ProtectedRoute>}
      />
      <Route
        path={ROUTES.GROUPS}
        element={<ProtectedRoute><div className="p-8">Groups — coming in PR #18</div></ProtectedRoute>}
      />
      <Route
        path={ROUTES.SETTINGS}
        element={<ProtectedRoute><div className="p-8">Settings — coming in PR #16</div></ProtectedRoute>}
      />

      {/* Default */}
      <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
