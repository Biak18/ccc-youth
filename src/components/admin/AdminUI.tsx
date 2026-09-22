import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Status } from '../../types/db'

export function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    published: 'bg-green-100 text-green-800',
    draft: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-gray-200 text-gray-700',
  }
  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${styles[status]}`}
    >
      {status}
    </span>
  )
}

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-ink">
        {label}
        {required && <span className="text-brand-red"> *</span>}
      </span>
      {hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  )
}

export const inputClass =
  'w-full rounded-lg border border-line bg-card px-3 py-2.5 text-ink shadow-sm placeholder:text-muted focus:border-skyblue'

export function FormError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p className="rounded-lg bg-brand-red/10 px-4 py-3 text-sm font-medium text-brand-red-dark dark:text-ember">
      {message}
    </p>
  )
}

export function AdminHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-heading">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function PrimaryLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex rounded-lg bg-brand-red px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-red-dark"
    >
      {children}
    </Link>
  )
}

export const btnPrimary =
  'inline-flex items-center justify-center rounded-lg bg-brand-red px-5 py-3 text-sm font-semibold text-white hover:bg-brand-red-dark disabled:opacity-50'
export const btnSecondary =
  'inline-flex items-center justify-center rounded-lg bg-card px-5 py-3 text-sm font-semibold text-heading ring-1 ring-line hover:bg-surface disabled:opacity-50'
export const btnGhost =
  'text-sm font-semibold text-heading hover:text-brand-red disabled:opacity-50'
