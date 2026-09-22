import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useEventById } from '../../hooks/useAdminData'
import { slugify } from '../../lib/format'
import { uploadSingleImage } from '../../lib/upload'
import type { Status } from '../../types/db'
import {
  AdminHeader,
  Field,
  FormError,
  btnPrimary,
  btnSecondary,
  inputClass,
} from '../../components/admin/AdminUI'

/** <input type="datetime-local"> needs "YYYY-MM-DDTHH:mm" in local time. */
const toLocalInput = (iso: string | null) => {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function EventForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const { session } = useAuth()
  const existing = useEventById(id)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [registrationUrl, setRegistrationUrl] = useState('')
  const [contact, setContact] = useState('')
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const e = existing.data
    if (!e) return
    setTitle(e.title)
    setSlug(e.slug)
    setStart(toLocalInput(e.start_date))
    setEnd(toLocalInput(e.end_date))
    setLocation(e.location ?? '')
    setDescription(e.description ?? '')
    setRegistrationUrl(e.registration_url ?? '')
    setContact(e.contact_information ?? '')
    setCoverUrl(e.cover_image_url)
  }, [existing.data])

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title))
  }, [title, slugTouched])

  const pickCover = async (file: File) => {
    setBusy(true)
    try {
      setCoverUrl(await uploadSingleImage(file, 'images', 'events'))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const save = async (status: Status) => {
    if (!session?.user) return
    if (!title.trim() || !start) {
      setError('Title, date and time are required.')
      return
    }
    setBusy(true)
    setError(null)

    const payload = {
      title: title.trim(),
      slug: slug.trim() || slugify(title),
      description: description.trim() || null,
      location: location.trim() || null,
      start_date: new Date(start).toISOString(),
      end_date: end ? new Date(end).toISOString() : null,
      registration_url: registrationUrl.trim() || null,
      contact_information: contact.trim() || null,
      cover_image_url: coverUrl,
      status,
    }

    const res = editing
      ? await supabase.from('events').update(payload).eq('id', id!)
      : await supabase.from('events').insert({ ...payload, created_by: session.user.id })

    setBusy(false)
    if (res.error) {
      setError(
        res.error.code === '23505'
          ? 'That web address (slug) is already used by another event.'
          : res.error.message,
      )
    } else {
      navigate('/admin/events')
    }
  }

  return (
    <>
      <AdminHeader title={editing ? 'Edit Event' : 'New Event'} subtitle="Something coming up." />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          save('published')
        }}
        className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line"
      >
        <FormError message={error} />

        <Field label="Title" required>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Youth Fellowship"
            className={inputClass}
            required
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Starts" required>
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className={inputClass}
              required
            />
          </Field>
          <Field label="Ends" hint="Optional.">
            <input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Location">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Web address" hint={`/events/${slug || 'your-title'}`}>
          <input
            value={slug}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(slugify(e.target.value))
            }}
            className={inputClass}
          />
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={inputClass}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Registration link" hint="Optional.">
            <input
              type="url"
              value={registrationUrl}
              onChange={(e) => setRegistrationUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </Field>
          <Field label="Contact information" hint="Optional.">
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Cover image">
          <div className="flex items-center gap-4">
            {coverUrl && (
              <img
                src={coverUrl}
                alt=""
                className="h-20 w-28 rounded-lg object-cover ring-1 ring-line"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) pickCover(f)
              }}
              className="text-sm"
            />
            {coverUrl && (
              <button
                type="button"
                onClick={() => setCoverUrl(null)}
                className="text-sm font-semibold text-brand-red hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        </Field>

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
            onClick={() => navigate('/admin/events')}
            className={btnSecondary}
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  )
}
