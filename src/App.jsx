import { AuthProvider, useAuth } from './hooks/useAuth'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <AuthPage />
  return <Dashboard />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
