import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAdminQuery } from '../../hooks/useAdminData'
import { useAuth } from '../../hooks/useAuth'
import type { Profile, Role } from '../../types/db'
import { AdminHeader, FormError } from '../../components/admin/AdminUI'

export default function Users() {
  const { data, loading, error, reload } = useAdminQuery<Profile[]>(() =>
    supabase.from('profiles').select('*').order('created_at', { ascending: true }),
  )
  const { profile } = useAuth()
  const [busy, setBusy] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const setRole = async (id: string, role: Role) => {
    setBusy(id)
    setActionError(null)
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
    setBusy(null)
    if (error) setActionError(error.message)
    else reload()
  }

  const admins = (data ?? []).filter((u) => u.role === 'admin').length

  return (
    <>
      <AdminHeader
        title="Users"
        subtitle="Dashboard accounts. New users start as leaders."
      />

      <FormError message={error ?? actionError} />

      <div className="mb-6 rounded-xl bg-card p-5 text-sm text-ink/80 shadow-sm ring-1 ring-line">
        <p className="font-semibold text-heading">Adding a Youth leader</p>
        <p className="mt-1">
          Supabase Dashboard &rarr; Authentication &rarr; Users &rarr; Add user. Tick
          &ldquo;Auto Confirm User&rdquo;, then share the password. Their account appears
          here automatically.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-line">
        {loading ? (
          <p className="px-5 py-8 text-center text-sm text-muted">Loading...</p>
        ) : data?.length ? (
          <ul className="divide-y divide-line">
            {data.map((u) => {
              const isSelf = u.id === profile?.id
              const lastAdmin = u.role === 'admin' && admins <= 1
              return (
                <li key={u.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-heading">
                      {u.display_name ?? u.email}
                      {isSelf && <span className="ml-2 text-xs text-muted">(you)</span>}
                    </p>
                    <p className="truncate text-sm text-muted">{u.email}</p>
                  </div>
                  <span
                    className={[
                      'rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wide',
                      u.role === 'admin'
                        ? 'bg-brand-red text-white'
                        : 'bg-surface text-heading ring-1 ring-line',
                    ].join(' ')}
                  >
                    {u.role}
                  </span>
                  <button
                    type="button"
                    disabled={busy === u.id || lastAdmin}
                    title={lastAdmin ? 'There must be at least one admin' : undefined}
                    onClick={() => setRole(u.id, u.role === 'admin' ? 'leader' : 'admin')}
                    className="text-sm font-semibold text-heading hover:text-ember disabled:opacity-40"
                  >
                    {u.role === 'admin' ? 'Make leader' : 'Make admin'}
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-muted">No users yet.</p>
        )}
      </div>
    </>
  )
}
