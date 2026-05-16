import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/constants'
import { LoginPage } from '@/features/auth/components/LoginPage'
import { RegisterPage } from '@/features/auth/components/RegisterPage'
import { AuthCallback } from '@/features/auth/components/AuthCallback'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'

const queryClient = new QueryClient()

function AppRoutes() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Onboarding — built in PR #4 */}
      <Route path={ROUTES.ONBOARDING} element={<div className="p-8">Onboarding — coming in PR #4</div>} />

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
