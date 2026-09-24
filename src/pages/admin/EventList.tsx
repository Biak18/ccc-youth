import { Link } from 'react-router-dom'
import { useState } from 'react'
import { authedDelete, authedPatch } from '../../lib/api'
import { useAllEvents } from '../../hooks/useAdminData'
import { formatShort, isUpcoming } from '../../lib/format'
import type { Status } from '../../types/db'
import {
  AdminHeader,
  FormError,
  PrimaryLink,
  StatusBadge,
  btnGhost,
} from '../../components/admin/AdminUI'

export default function EventList() {
  const { data, loading, error, reload } = useAllEvents()
  const [busy, setBusy] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const act = async (fn: () => Promise<unknown>, id: string) => {
    setBusy(id)
    setActionError(null)
    try {
      await fn()
      reload()
    } catch (e) {
      setActionError((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const setStatus = (id: string, status: Status) =>
    act(() => authedPatch(`/api/events/${id}/status`, { status }), id)

  const remove = (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"?`)) return
    act(() => authedDelete(`/api/events/${id}`), id)
  }

  return (
    <>
      <AdminHeader
        title="Events"
        subtitle="Upcoming and past Youth events."
        action={<PrimaryLink to="/admin/events/new">+ New Event</PrimaryLink>}
      />

      <FormError message={error ?? actionError} />

      <div className="mt-4 overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-line">
        {loading ? (
          <p className="px-5 py-8 text-center text-sm text-muted">Loading...</p>
        ) : data?.length ? (
          <ul className="divide-y divide-line">
            {data.map((e) => (
              <li key={e.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to={`/admin/events/${e.id}/edit`}
                    className="min-w-0 flex-1 truncate font-semibold text-heading hover:text-brand-red"
                  >
                    {e.title}
                  </Link>
                  <span className="text-sm text-muted">
                    {formatShort(e.startDate)}
                    {isUpcoming(e.startDate) ? ' - upcoming' : ''}
                  </span>
                  <StatusBadge status={e.status} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4">
                  {e.status === 'published' && (
                    <Link to={`/events/${e.slug}`} className={btnGhost}>
                      View
                    </Link>
                  )}
                  <Link to={`/admin/events/${e.id}/edit`} className={btnGhost}>
                    Edit
                  </Link>
                  {e.status !== 'published' ? (
                    <button
                      type="button"
                      disabled={busy === e.id}
                      onClick={() => setStatus(e.id, 'published')}
                      className={btnGhost}
                    >
                      Publish
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy === e.id}
                      onClick={() => setStatus(e.id, 'draft')}
                      className={btnGhost}
                    >
                      Unpublish
                    </button>
                  )}
                  {e.status !== 'archived' && (
                    <button
                      type="button"
                      disabled={busy === e.id}
                      onClick={() => setStatus(e.id, 'archived')}
                      className={btnGhost}
                    >
                      Archive
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy === e.id}
                    onClick={() => remove(e.id, e.title)}
                    className="text-sm font-semibold text-brand-red hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-muted">No events yet.</p>
        )}
      </div>
    </>
  )
}
