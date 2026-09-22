import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useActivityById, useMediaByActivity } from '../../hooks/useAdminData'
import { slugify } from '../../lib/format'
import { CATEGORIES } from '../../lib/categories'
import { deletePhotoFiles, uploadPhoto } from '../../lib/upload'
import type { Media, Status } from '../../types/db'
import PhotoUploader, { type PendingPhoto } from '../../components/admin/PhotoUploader'
import VideoLinks, { type PendingVideo } from '../../components/admin/VideoLinks'
import {
  AdminHeader,
  Field,
  FormError,
  btnPrimary,
  btnSecondary,
  inputClass,
} from '../../components/admin/AdminUI'
import { youtubeId } from '../../lib/format'

export default function ActivityForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const { session } = useAuth()

  const existingActivity = useActivityById(id)
  const existingMedia = useMediaByActivity(id)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [activityDate, setActivityDate] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [coverUrl, setCoverUrl] = useState<string | null>(null)

  const [photos, setPhotos] = useState<Media[]>([])
  const [videos, setVideos] = useState<Media[]>([])
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([])
  const [pendingVideos, setPendingVideos] = useState<PendingVideo[]>([])

  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // Load the record when editing
  useEffect(() => {
    const a = existingActivity.data
    if (!a) return
    setTitle(a.title)
    setSlug(a.slug)
    setActivityDate(a.activity_date)
    setLocation(a.location ?? '')
    setCategory(a.category ?? '')
    setDescription(a.description ?? '')
    setCoverUrl(a.cover_image_url)
  }, [existingActivity.data])

  useEffect(() => {
    const rows = existingMedia.data ?? []
    setPhotos(rows.filter((m) => m.type === 'image'))
    setVideos(rows.filter((m) => m.type === 'video'))
  }, [existingMedia.data])

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title))
  }, [title, slugTouched])

  // Release object URLs
  useEffect(
    () => () => pendingPhotos.forEach((p) => URL.revokeObjectURL(p.preview)),
    [pendingPhotos],
  )

  const addFiles = (files: File[]) =>
    setPendingPhotos((prev) => [
      ...prev,
      ...files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: crypto.randomUUID(),
      })),
    ])

  const movePhoto = (index: number, dir: -1 | 1) => {
    setPhotos((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const removeExistingPhoto = async (m: Media) => {
    if (!window.confirm('Remove this photo?')) return
    const { error } = await supabase.from('media').delete().eq('id', m.id)
    if (error) {
      setError(error.message)
      return
    }
    await deletePhotoFiles(m.url)
    setPhotos((prev) => prev.filter((p) => p.id !== m.id))
    if (coverUrl === m.url) setCoverUrl(null)
  }

  const removeExistingVideo = async (m: Media) => {
    const { error } = await supabase.from('media').delete().eq('id', m.id)
    if (error) setError(error.message)
    else setVideos((prev) => prev.filter((v) => v.id !== m.id))
  }

  const save = async (status: Status) => {
    if (!session?.user) return
    if (!title.trim() || !activityDate) {
      setError('Title and activity date are required.')
      return
    }

    setBusy(true)
    setError(null)
    const userId = session.user.id

    const payload = {
      title: title.trim(),
      slug: slug.trim() || slugify(title),
      description: description.trim() || null,
      activity_date: activityDate,
      location: location.trim() || null,
      category: category || null,
      status,
    }

    try {
      // 1. Upsert the activity so media rows have an id to attach to
      let activityId = id ?? ''
      if (editing) {
        const { error } = await supabase.from('activities').update(payload).eq('id', activityId)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('activities')
          .insert({ ...payload, created_by: userId })
          .select('id')
          .single()
        if (error) throw error
        activityId = data.id
      }

      // 2. Upload new photos
      const uploaded: { url: string; thumbnail_url: string }[] = []
      for (let i = 0; i < pendingPhotos.length; i++) {
        setProgress(`Uploading photo ${i + 1} of ${pendingPhotos.length}...`)
        uploaded.push(await uploadPhoto(pendingPhotos[i].file, activityId))
      }

      if (uploaded.length) {
        const { error } = await supabase.from('media').insert(
          uploaded.map((u, i) => ({
            activity_id: activityId,
            type: 'image' as const,
            source: 'storage' as const,
            url: u.url,
            thumbnail_url: u.thumbnail_url,
            sort_order: photos.length + i,
            uploaded_by: userId,
          })),
        )
        if (error) throw error
      }

      // 3. Insert new video links
      if (pendingVideos.length) {
        setProgress('Saving videos...')
        const { error } = await supabase.from('media').insert(
          pendingVideos.map((v, i) => ({
            activity_id: activityId,
            type: 'video' as const,
            source: youtubeId(v.url) ? ('youtube' as const) : ('external' as const),
            url: v.url,
            title: v.title || null,
            sort_order: videos.length + i,
            uploaded_by: userId,
          })),
        )
        if (error) throw error
      }

      // 4. Persist photo order
      setProgress('Saving order...')
      await Promise.all(
        photos.map((p, i) =>
          supabase.from('media').update({ sort_order: i }).eq('id', p.id),
        ),
      )

      // 5. Cover image: explicit choice, else the first photo
      const cover = coverUrl ?? photos[0]?.url ?? uploaded[0]?.url ?? null
      if (cover) {
        const { error } = await supabase
          .from('activities')
          .update({ cover_image_url: cover })
          .eq('id', activityId)
        if (error) throw error
      }

      navigate('/admin/activities')
    } catch (e) {
      const err = e as { message?: string; code?: string }
      setError(
        err.code === '23505'
          ? 'That web address (slug) is already used by another activity. Change it and try again.'
          : (err.message ?? 'Could not save this activity.'),
      )
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  return (
    <>
      <AdminHeader
        title={editing ? 'Edit Activity' : 'New Activity'}
        subtitle="Record something the Youth did, with photos and videos."
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
            placeholder="Youth Camp 2026"
            className={inputClass}
            required
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Activity date" hint="The day it actually happened." required>
            <input
              type="date"
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
              className={inputClass}
              required
            />
          </Field>
          <Field label="Location">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Christian City Church"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Category" hint="Used for filtering on the Memories page.">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            <option value="">No category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Web address" hint={`/activities/${slug || 'your-title'}`}>
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
            rows={5}
            placeholder="A Youth gathering focused on worship, fellowship, Bible study and group activities."
            className={inputClass}
          />
        </Field>

        <div>
          <h2 className="text-sm font-semibold text-ink">Photos</h2>
          <p className="mb-2 text-xs text-muted">
            The cover photo appears on cards. If you do not choose one, the first photo is used.
          </p>
          <PhotoUploader
            existing={photos}
            pending={pendingPhotos}
            coverUrl={coverUrl}
            onAddFiles={addFiles}
            onRemovePending={(pid) =>
              setPendingPhotos((prev) => prev.filter((p) => p.id !== pid))
            }
            onRemoveExisting={removeExistingPhoto}
            onMoveExisting={movePhoto}
            onSetCover={setCoverUrl}
            disabled={busy}
          />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ink">Videos</h2>
          <p className="mb-2 text-xs text-muted">
            Paste a YouTube link. Keeping large videos on YouTube keeps the site fast.
          </p>
          <VideoLinks
            existing={videos}
            pending={pendingVideos}
            onAdd={(v) => setPendingVideos((prev) => [...prev, v])}
            onRemovePending={(vid) =>
              setPendingVideos((prev) => prev.filter((p) => p.id !== vid))
            }
            onRemoveExisting={removeExistingVideo}
            disabled={busy}
          />
        </div>

        {progress && <p className="text-sm font-medium text-skyblue">{progress}</p>}

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
            onClick={() => navigate('/admin/activities')}
            className={btnSecondary}
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  )
}
