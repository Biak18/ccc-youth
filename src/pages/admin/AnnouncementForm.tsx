import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { authedPatch, authedPost, authedPut, ApiError } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'
import { useAnnouncementById } from '../../hooks/useAdminData'
import { slugify } from '../../lib/format'
import type { Announcement } from '../../types/db'
import {
  AdminHeader,
  Field,
  FormError,
  btnPrimary,
  btnSecondary,
  inputClass,
} from '../../components/admin/AdminUI'

export default function AnnouncementForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuth()
  const existing = useAnnouncementById(id)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [content, setContent] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const a = existing.data
    if (!a) return
    setTitle(a.title)
    setSlug(a.slug)
    setContent(a.content ?? '')
    setIsPinned(a.isPinned)
  }, [existing.data])

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title))
  }, [title, slugTouched])

  const save = async (publish: boolean) => {
    if (!user) return
    if (!title.trim()) {
      setError('A title is required.')
      return
    }
    setBusy(true)
    setError(null)

    try {
      let announcementId = id ?? ''
      if (editing) {
        // The update endpoint replaces the whole record, so the
        // existing cover must be re-sent or it would be wiped to null.
        await authedPut(`/api/announcements/${announcementId}`, {
          title: title.trim(),
          content: content.trim() || null,
          coverImageUrl: existing.data?.coverImageUrl ?? null,
        })
      } else {
        const created = await authedPost<Announcement>('/api/announcements', {
          title: title.trim(),
          ...(slugTouched && slug.trim() ? { slug: slug.trim() } : {}),
          content: content.trim() || null,
        })
        announcementId = created.id
      }

      // Pinning is a separate endpoint, not part of the payload.
      if (isPinned !== (existing.data?.isPinned ?? false)) {
        await authedPatch(`/api/announcements/${announcementId}/pin`, { isPinned })
      }

      if (publish) {
        await authedPatch(`/api/announcements/${announcementId}/status`, {
          status: 'published',
        })
      }

      navigate('/admin/announcements')
    } catch (e) {
      setBusy(false)
      if (e instanceof ApiError && (e.status === 409 || e.status === 400) && /slug/i.test(e.message)) {
        setError('That web address (slug) is already used by another announcement.')
      } else {
        setError((e as Error).message ?? 'Could not save this announcement.')
      }
    }
  }

  return (
    <>
      <AdminHeader
        title={editing ? 'Edit Announcement' : 'New Announcement'}
        subtitle="Keep it short and clear."
      />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          save(true)
        }}
        className="space-y-6 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-line"
      >
        <FormError message={error} />

        <Field label="Title" required>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Youth Fellowship moved to 4:00 PM"
            className={inputClass}
            required
          />
        </Field>

        <Field label="Content">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className={inputClass}
          />
        </Field>

        <Field label="Web address" hint={`/announcements/${slug || 'your-title'}`}>
          <input
            value={slug}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(slugify(e.target.value))
            }}
            className={inputClass}
          />
        </Field>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="h-5 w-5 rounded border-line"
          />
          <span className="text-sm font-semibold text-ink">
            Pin this announcement
            <span className="ml-1 font-normal text-muted">(shows first, with a red accent)</span>
          </span>
        </label>

        <div className="flex flex-wrap gap-3 border-t border-line pt-6">
          <button type="submit" disabled={busy} className={btnPrimary}>
            {busy ? 'Saving...' : 'Publish'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => save(false)}
            className={btnSecondary}
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => navigate('/admin/announcements')}
            className={btnSecondary}
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  )
}
