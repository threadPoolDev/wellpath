import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/constants'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { LoginPage } from '@/features/auth/components/LoginPage'
import { RegisterPage } from '@/features/auth/components/RegisterPage'
import { AuthCallback } from '@/features/auth/components/AuthCallback'
import { GuestRoute } from '@/features/auth/components/GuestRoute'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { OnboardingFlow } from '@/features/onboarding/OnboardingFlow'
import { MorningCheckin } from '@/features/checkin/MorningCheckin'
import { Dashboard } from '@/features/dashboard/Dashboard'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { GroupsPage } from '@/features/groups/GroupsPage'
import { AppShell } from '@/components/layout/AppShell'

const queryClient = new QueryClient()

function AppRoutes() {
  const initialize = useAuthStore((s) => s.initialize)
  const user = useAuthStore((s) => s.user)
  usePushNotifications(!!user)

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

      {/* Onboarding — outside the shell; requires auth */}
      <Route path={ROUTES.ONBOARDING} element={<ProtectedRoute><OnboardingFlow /></ProtectedRoute>} />

      {/* Morning check-in — outside the shell; requires auth */}
      <Route path="/checkin/morning" element={<ProtectedRoute><MorningCheckin /></ProtectedRoute>} />

      {/* Shell-wrapped authenticated routes */}
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.GROUPS} element={<GroupsPage />} />
        <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        <Route path={ROUTES.HISTORY} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Route>

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
