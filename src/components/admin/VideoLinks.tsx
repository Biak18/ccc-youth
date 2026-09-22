import { useState } from 'react'
import type { Media } from '../../types/db'
import { youtubeId, youtubeThumb } from '../../lib/format'
import { inputClass } from './AdminUI'

export type PendingVideo = { id: string; url: string; title: string }

/**
 * Videos are added by URL. Large files belong on YouTube rather than in
 * application storage (ARCHITECTURE.md section 6).
 */
export default function VideoLinks({
  existing,
  pending,
  onAdd,
  onRemovePending,
  onRemoveExisting,
  disabled,
}: {
  existing: Media[]
  pending: PendingVideo[]
  onAdd: (v: PendingVideo) => void
  onRemovePending: (id: string) => void
  onRemoveExisting: (m: Media) => void
  disabled?: boolean
}) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  const add = () => {
    const trimmed = url.trim()
    if (!trimmed) return
    if (!/^https?:\/\//i.test(trimmed)) {
      setError('Enter a full link starting with https://')
      return
    }
    setError(null)
    onAdd({ id: crypto.randomUUID(), url: trimmed, title: title.trim() })
    setUrl('')
    setTitle('')
  }

  const rows = [
    ...existing.map((m) => ({
      key: m.id,
      url: m.url,
      title: m.title ?? '',
      isNew: false,
      remove: () => onRemoveExisting(m),
    })),
    ...pending.map((p) => ({
      key: p.id,
      url: p.url,
      title: p.title,
      isNew: true,
      remove: () => onRemovePending(p.id),
    })),
  ]

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="YouTube or video URL"
          className={inputClass}
          disabled={disabled}
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Video title (optional)"
          className={inputClass}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={add}
          disabled={disabled}
          className="rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark"
        >
          Add video
        </button>
      </div>
      {error && <p className="mt-2 text-sm font-medium text-brand-red">{error}</p>}

      {rows.length > 0 && (
        <ul className="mt-4 space-y-2">
          {rows.map((r) => {
            const thumb = youtubeThumb(r.url)
            return (
              <li
                key={r.key}
                className="flex items-center gap-3 rounded-lg border border-line bg-card p-2"
              >
                <div className="h-12 w-20 shrink-0 overflow-hidden rounded bg-navy">
                  {thumb && <img src={thumb} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {r.title || (youtubeId(r.url) ? 'YouTube video' : 'Video')}
                  </p>
                  <p className="truncate text-xs text-muted">{r.url}</p>
                </div>
                {r.isNew && <span className="text-xs font-semibold text-skyblue">New</span>}
                <button
                  type="button"
                  onClick={r.remove}
                  disabled={disabled}
                  className="rounded px-2 py-1 text-xs font-semibold text-brand-red hover:bg-brand-red/10"
                >
                  Remove
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
