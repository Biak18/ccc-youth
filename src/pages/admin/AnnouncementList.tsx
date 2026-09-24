import { Link } from 'react-router-dom'
import { useState } from 'react'
import { authedDelete, authedPatch } from '../../lib/api'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { useAllAnnouncements } from '../../hooks/useAdminData'
import { formatShort } from '../../lib/format'
import type { Status } from '../../types/db'
import {
  AdminHeader,
  FormError,
  PrimaryLink,
  StatusBadge,
  btnGhost,
} from '../../components/admin/AdminUI'

export default function AnnouncementList() {
  const { data, loading, error, reload, setData } = useAllAnnouncements()
  const [busy, setBusy] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(
    null,
  )

  const run = async (fn: () => Promise<unknown>, id: string) => {
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

  return (
    <>
      <AdminHeader
        title="Announcements"
        subtitle="Short notices for the Youth."
        action={<PrimaryLink to="/admin/announcements/new">+ New Announcement</PrimaryLink>}
      />

      <FormError message={error ?? actionError} />

      <div className="mt-4 overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-line">
        {loading ? (
          <p className="px-5 py-8 text-center text-sm text-muted">Loading...</p>
        ) : data?.length ? (
          <ul className="divide-y divide-line">
            {data.map((a) => (
              <li key={a.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to={`/admin/announcements/${a.id}/edit`}
                    className="min-w-0 flex-1 truncate font-semibold text-heading hover:text-brand-red"
                  >
                    {a.title}
                  </Link>
                  {a.isPinned && (
                    <span className="rounded bg-brand-red px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                      Pinned
                    </span>
                  )}
                  {a.publishedAt && (
                    <span className="text-sm text-muted">{formatShort(a.publishedAt)}</span>
                  )}
                  <StatusBadge status={a.status} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4">
                  <Link to={`/admin/announcements/${a.id}/edit`} className={btnGhost}>
                    Edit
                  </Link>
                  <button
                    type="button"
                    disabled={busy === a.id}
                    onClick={() =>
                      run(
                        () =>
                          authedPatch(`/api/announcements/${a.id}/pin`, {
                            isPinned: !a.isPinned,
                          }),
                        a.id,
                      )
                    }
                    className={btnGhost}
                  >
                    {a.isPinned ? 'Unpin' : 'Pin'}
                  </button>
                  {a.status !== 'published' ? (
                    <button
                      type="button"
                      disabled={busy === a.id}
                      onClick={() =>
                        run(
                          () =>
                            authedPatch(`/api/announcements/${a.id}/status`, {
                              status: 'published' as Status,
                            }),
                          a.id,
                        )
                      }
                      className={btnGhost}
                    >
                      Publish
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy === a.id}
                      onClick={() =>
                        run(
                          () =>
                            authedPatch(`/api/announcements/${a.id}/status`, {
                              status: 'draft' as Status,
                            }),
                          a.id,
                        )
                      }
                      className={btnGhost}
                    >
                      Unpublish
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
          <p className="px-5 py-8 text-center text-sm text-muted">No announcements yet.</p>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={pendingDelete ? `Delete "${pendingDelete.title}"?` : ''}
        busy={busy !== null}
        onConfirm={async () => {
          if (!pendingDelete) return
          const id = pendingDelete.id
          const snapshot = data ?? []
          setPendingDelete(null)
          setData(snapshot.filter((a) => a.id !== id))
          try {
            await authedDelete(`/api/announcements/${id}`)
            reload()
          } catch (e) {
            setData(snapshot)
            setActionError((e as Error).message)
          }
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}
