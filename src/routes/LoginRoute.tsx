import { AuthProvider } from '../hooks/useAuth'
import Login from '../pages/admin/Login'

/** Lazy entry point so supabase-js is not in the public bundle. */
export default function LoginRoute() {
  return (
    <AuthProvider>
      <Login />
    </AuthProvider>
  )
}
