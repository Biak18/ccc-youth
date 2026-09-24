import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo/church-logo.png'
import { useAuth } from '../../hooks/useAuth'
import { FormError, Field, inputClass, btnPrimary } from '../../components/admin/AdminUI'
import { site } from '../../site'

export default function Login() {
  const { user, signIn, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!loading && user) {
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from ?? '/admin'} replace />
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await signIn(email.trim(), password)
    setBusy(false)
    if (error) setError(error)
    else navigate('/admin', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-12">
      <Link to="/" className="flex flex-col items-center gap-3">
        <img src={logo} alt={`${site.churchName} logo`} className="h-16 w-auto" />
        <span className="text-center">
          <span className="block text-xs font-semibold uppercase tracking-wide text-muted">
            {site.churchName}
          </span>
          <span className="block text-xl font-bold text-heading">Youth Admin</span>
        </span>
      </Link>

      <form
        onSubmit={submit}
        className="mt-8 w-full max-w-sm space-y-4 rounded-2xl bg-card p-6 shadow-sm"
      >
        <FormError message={error} />
        <Field label="Email" required>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className={inputClass}
          />
        </Field>
        <Field label="Password" required>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </Field>
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>
          {busy ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="text-center text-xs text-muted">
          Youth leader accounts are created by an administrator.
        </p>
      </form>

      <Link to="/" className="mt-6 text-sm font-semibold text-heading hover:text-brand-red">
        &larr; Back to the website
      </Link>
    </div>
  )
}
