import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'

function Checking() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted">Checking your sign-in...</p>
    </div>
  )
}

/** Any signed-in leader or admin. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Checking />
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return <>{children}</>
}

/** Admins only. Authorization is enforced again by the API on the server. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin } = useAuth()

  if (loading) return <Checking />
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-brand-red/30 bg-brand-red/5 p-8 text-center">
        <h1 className="text-lg font-bold text-heading">Admins only</h1>
        <p className="mt-2 text-sm text-muted">
          This page is limited to administrators.
        </p>
      </div>
    )
  }
  return <>{children}</>
}
