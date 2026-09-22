import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import logo from '../assets/logo/church-logo.png'
import { site, navLinks } from '../site'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  // Skill ui-ux-pro-max: keyboard focus needs a visible, unobscured path.
  // Esc closes the mobile menu and returns focus to the toggle.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open ])

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"
        aria-label="Main navigation"
      >
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img src={logo} alt={`${site.churchName} logo`} className="h-10 w-auto" />
          <span className="leading-tight">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted">
              {site.churchName}
            </span>
            <span className="block text-lg font-bold text-navy">Youth</span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                [
                  'inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-red/10 text-brand-red'
                    : 'text-ink hover:bg-surface hover:text-navy',
                ].join(' ')
              }
            >
              {l.label}
            </NavLink>
          ))}
          <a
            href={site.facebookUrl}
            target="_blank"
            rel="noreferrer"
            className="ml-2 inline-flex min-h-11 items-center rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-dark"
          >
            Facebook
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-navy hover:bg-surface lg:hidden"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-line bg-white lg:hidden">
          <div className="mx-auto max-w-6xl px-4 py-2">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  [
                    'block rounded-md px-3 py-3 text-base font-medium',
                    isActive ? 'bg-surface text-brand-red' : 'text-ink hover:bg-surface',
                  ].join(' ')
                }
              >
                {l.label}
              </NavLink>
            ))}
            <a
              href={site.facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="mb-3 mt-2 block rounded-md bg-navy px-3 py-3 text-center text-base font-semibold text-white"
            >
              Follow on Facebook
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
