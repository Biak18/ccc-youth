import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authedDelete, authedPatch } from '../../lib/api'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { useAllActivities } from '../../hooks/useAdminData'
import { formatShort } from '../../lib/format'
import type { Status } from '../../types/db'
import {
  AdminHeader,
  FormError,
  PrimaryLink,
  StatusBadge,
  btnGhost,
  inputClass,
} from '../../components/admin/AdminUI'

const FILTERS: (Status | 'all')[] = ['all', 'draft', 'published', 'archived']

export default function ActivityList() {
  const { data, loading, error, reload, setData } = useAllActivities()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(
    null,
  )

  const filter = (params.get('status') as Status | 'all') ?? 'all'
  const rows = (data ?? [])
    .filter((a) => filter === 'all' || a.status === filter)
    .filter((a) => a.title.toLowerCase().includes(search.toLowerCase()))

  const setStatus = async (id: string, status: Status) => {
    setBusy(id)
    setActionError(null)
    try {
      await authedPatch(`/api/activities/${id}/status`, { status })
      reload()
    } catch (e) {
      setActionError((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const remove = async () => {
    if (!pendingDelete) return
    const id = pendingDelete.id
    const snapshot = data ?? []
    // Optimistic: drop the row instantly, sync in the background.
    // On failure (e.g. 403 on someone else's content) put it back.
    setPendingDelete(null)
    setData(snapshot.filter((a) => a.id !== id))
    try {
      await authedDelete(`/api/activities/${id}`)
      reload()
    } catch (e) {
      setData(snapshot)
      setActionError((e as Error).message)
    }
  }

  return (
    <>
      <AdminHeader
        title="Activities"
        subtitle="Your historical Youth content."
        action={<PrimaryLink to="/admin/activities/new">+ New Activity</PrimaryLink>}
      />

      <div className="mb-5 space-y-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title"
          className={`${inputClass} max-w-sm`}
        />
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setParams(f === 'all' ? {} : { status: f }, { replace: true })}
              aria-pressed={filter === f}
              className={[
                'rounded-full px-4 py-2 text-sm font-semibold capitalize',
                filter === f
                  ? 'bg-navy text-white'
                  : 'bg-card text-ink ring-1 ring-line hover:bg-surface',
              ].join(' ')}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <FormError message={error ?? actionError} />

      <div className="mt-4 overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-line">
        {loading ? (
          <p className="px-5 py-8 text-center text-sm text-muted">Loading...</p>
        ) : rows.length ? (
          <ul className="divide-y divide-line">
            {rows.map((a) => (
              <li key={a.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to={`/admin/activities/${a.id}/edit`}
                    className="min-w-0 flex-1 truncate font-semibold text-heading hover:text-brand-red"
                  >
                    {a.title}
                  </Link>
                  <span className="text-sm text-muted">{formatShort(a.activityDate)}</span>
                  <StatusBadge status={a.status} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4">
                  {a.status === 'published' && (
                    <Link to={`/activities/${a.slug}`} className={btnGhost}>
                      View
                    </Link>
                  )}
                  <Link to={`/admin/activities/${a.id}/edit`} className={btnGhost}>
                    Edit
                  </Link>
                  {a.status !== 'published' && (
                    <button
                      type="button"
                      disabled={busy === a.id}
                      onClick={() => setStatus(a.id, 'published')}
                      className={btnGhost}
                    >
                      Publish
                    </button>
                  )}
                  {a.status === 'published' && (
                    <button
                      type="button"
                      disabled={busy === a.id}
                      onClick={() => setStatus(a.id, 'draft')}
                      className={btnGhost}
                    >
                      Unpublish
                    </button>
                  )}
                  {a.status !== 'archived' && (
                    <button
                      type="button"
                      disabled={busy === a.id}
                      onClick={() => setStatus(a.id, 'archived')}
                      className={btnGhost}
                    >
                      Archive
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy === a.id}
                    onClick={() => setPendingDelete({ id: a.id, title: a.title })}
                    className="text-sm font-semibold text-brand-red hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-muted">Nothing here yet.</p>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={pendingDelete ? `Delete "${pendingDelete.title}"?` : ''}
        message="Its photos and videos will be removed too."
        busy={busy !== null}
        onConfirm={remove}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}
