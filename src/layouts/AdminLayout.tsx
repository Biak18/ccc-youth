import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import logo from '../assets/logo/church-logo.png'
import { useAuth } from '../hooks/useAuth'

export default function AdminLayout() {
  const { profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const links = [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/activities', label: 'Activities' },
    { to: '/admin/events', label: 'Events' },
    { to: '/admin/announcements', label: 'Announcements' },
    ...(isAdmin
      ? [
          { to: '/admin/leaders', label: 'Youth Leaders' },
          { to: '/admin/users', label: 'Users' },
          { to: '/admin/settings', label: 'Site Settings' },
        ]
      : []),
  ]

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'block rounded-lg px-3 py-2.5 text-sm font-medium',
      isActive ? 'bg-brand-red text-white' : 'text-white/80 hover:bg-white/10',
    ].join(' ')

  const logout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface lg:flex-row">
      {/* Mobile bar */}
      <div className="flex items-center justify-between bg-navy px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <img src={logo} alt="" className="h-8 w-auto" />
          <span className="text-sm font-bold text-white">CCC Youth Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle admin menu"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-white hover:bg-white/10"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={[
          'bg-navy lg:flex lg:w-64 lg:shrink-0 lg:flex-col',
          open ? 'block' : 'hidden',
        ].join(' ')}
      >
        <div className="hidden items-center gap-3 px-5 py-6 lg:flex">
          <img src={logo} alt="" className="h-10 w-auto" />
          <span className="leading-tight">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-white/60">
              CCC Youth
            </span>
            <span className="block font-bold text-white">Admin</span>
          </span>
        </div>

        <nav className="space-y-1 px-3 pb-4 pt-2 lg:pt-0" aria-label="Admin navigation">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 px-5 py-4">
          <p className="truncate text-sm font-medium text-white">
            {profile?.display_name ?? profile?.email ?? 'Signed in'}
          </p>
          <p className="text-xs uppercase tracking-wide text-white/50">
            {profile?.role ?? 'leader'}
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link to="/" className="font-semibold text-white/80 hover:text-white">
              View site
            </Link>
            <button
              type="button"
              onClick={logout}
              className="font-semibold text-white/80 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
