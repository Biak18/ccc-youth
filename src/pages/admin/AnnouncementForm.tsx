import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useAnnouncementById } from '../../hooks/useAdminData'
import { slugify } from '../../lib/format'
import type { Status } from '../../types/db'
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
  const { session } = useAuth()
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
    setIsPinned(a.is_pinned)
  }, [existing.data])

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title))
  }, [title, slugTouched])

  const save = async (status: Status) => {
    if (!session?.user) return
    if (!title.trim()) {
      setError('A title is required.')
      return
    }
    setBusy(true)
    setError(null)

    const payload = {
      title: title.trim(),
      slug: slug.trim() || slugify(title),
      content: content.trim() || null,
      is_pinned: isPinned,
      status,
      published_at:
        status === 'published'
          ? (existing.data?.published_at ?? new Date().toISOString())
          : existing.data?.published_at ?? null,
    }

    const res = editing
      ? await supabase.from('announcements').update(payload).eq('id', id!)
      : await supabase
          .from('announcements')
          .insert({ ...payload, created_by: session.user.id })

    setBusy(false)
    if (res.error) {
      setError(
        res.error.code === '23505'
          ? 'That web address (slug) is already used by another announcement.'
          : res.error.message,
      )
    } else {
      navigate('/admin/announcements')
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
          save('published')
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
            onClick={() => save('draft')}
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
