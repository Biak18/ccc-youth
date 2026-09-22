import { Link } from 'react-router-dom'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
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
  const { data, loading, error, reload } = useAllAnnouncements()
  const [busy, setBusy] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const run = async (
    fn: () => PromiseLike<{ error: { message: string } | null }>,
    id: string,
  ) => {
    setBusy(id)
    setActionError(null)
    const { error } = await fn()
    setBusy(null)
    if (error) setActionError(error.message)
    else reload()
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
                  {a.is_pinned && (
                    <span className="rounded bg-brand-red px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                      Pinned
                    </span>
                  )}
                  {a.published_at && (
                    <span className="text-sm text-muted">{formatShort(a.published_at)}</span>
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
                          supabase
                            .from('announcements')
                            .update({ is_pinned: !a.is_pinned })
                            .eq('id', a.id),
                        a.id,
                      )
                    }
                    className={btnGhost}
                  >
                    {a.is_pinned ? 'Unpin' : 'Pin'}
                  </button>
                  {a.status !== 'published' ? (
                    <button
                      type="button"
                      disabled={busy === a.id}
                      onClick={() =>
                        run(
                          () =>
                            supabase
                              .from('announcements')
                              .update({
                                status: 'published' as Status,
                                published_at: a.published_at ?? new Date().toISOString(),
                              })
                              .eq('id', a.id),
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
                            supabase
                              .from('announcements')
                              .update({ status: 'draft' as Status })
                              .eq('id', a.id),
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
                    onClick={() => {
                      if (window.confirm(`Delete "${a.title}"?`))
                        run(
                          () => supabase.from('announcements').delete().eq('id', a.id),
                          a.id,
                        )
                    }}
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
    </>
  )
}
