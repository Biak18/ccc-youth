import { useRef, useState } from 'react'
import type { Media } from '../../types/db'

export type PendingPhoto = { file: File; preview: string; id: string }

/**
 * Multi-select, drag-and-drop, preview, remove, reorder and cover
 * selection (CONTENT.md section 3).
 *
 * New files are held here until the activity is saved, because media
 * rows need an activity id.
 */
export default function PhotoUploader({
  existing,
  pending,
  coverUrl,
  onAddFiles,
  onRemovePending,
  onRemoveExisting,
  onMoveExisting,
  onSetCover,
  disabled,
}: {
  existing: Media[]
  pending: PendingPhoto[]
  coverUrl: string | null
  onAddFiles: (files: File[]) => void
  onRemovePending: (id: string) => void
  onRemoveExisting: (m: Media) => void
  onMoveExisting: (index: number, dir: -1 | 1) => void
  onSetCover: (url: string) => void
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const pick = (list: FileList | null) => {
    if (!list) return
    onAddFiles(Array.from(list).filter((f) => f.type.startsWith('image/')))
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          pick(e.dataTransfer.files)
        }}
        className={[
          'rounded-xl border-2 border-dashed p-6 text-center transition',
          dragging ? 'border-skyblue bg-skyblue/5' : 'border-line bg-surface',
        ].join(' ')}
      >
        <p className="text-sm text-ink/80">
          Drag photos here, or
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="ml-1 font-semibold text-brand-red hover:underline"
          >
            choose files
          </button>
        </p>
        <p className="mt-1 text-xs text-muted">
          You can select many at once. Photos are resized automatically before upload.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            pick(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {(existing.length > 0 || pending.length > 0) && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {existing.map((m, i) => (
            <li key={m.id} className="overflow-hidden rounded-lg border border-line bg-card">
              <img
                src={m.thumbnailUrl || m.url}
                alt={m.title ?? 'Activity photo'}
                className="aspect-square w-full object-cover"
              />
              <div className="flex items-center justify-between gap-1 p-1.5">
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => onMoveExisting(i, -1)}
                    disabled={i === 0 || disabled}
                    aria-label="Move photo earlier"
                    className="rounded px-1.5 py-1 text-xs text-heading hover:bg-surface disabled:opacity-30"
                  >
                    &larr;
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveExisting(i, 1)}
                    disabled={i === existing.length - 1 || disabled}
                    aria-label="Move photo later"
                    className="rounded px-1.5 py-1 text-xs text-heading hover:bg-surface disabled:opacity-30"
                  >
                    &rarr;
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveExisting(m)}
                  disabled={disabled}
                  className="rounded px-1.5 py-1 text-xs font-semibold text-brand-red hover:bg-brand-red/10"
                >
                  Remove
                </button>
              </div>
              <button
                type="button"
                onClick={() => onSetCover(m.url)}
                disabled={disabled}
                className={[
                  'w-full px-2 py-1.5 text-xs font-bold uppercase tracking-wide',
                  coverUrl === m.url
                    ? 'bg-brand-red text-white'
                    : 'bg-surface text-heading hover:bg-line',
                ].join(' ')}
              >
                {coverUrl === m.url ? 'Cover' : 'Make cover'}
              </button>
            </li>
          ))}

          {pending.map((p) => (
            <li
              key={p.id}
              className="overflow-hidden rounded-lg border border-dashed border-skyblue bg-card"
            >
              <img src={p.preview} alt="" className="aspect-square w-full object-cover" />
              <div className="flex items-center justify-between p-1.5">
                <span className="text-xs font-semibold text-skyblue">New</span>
                <button
                  type="button"
                  onClick={() => onRemovePending(p.id)}
                  disabled={disabled}
                  className="rounded px-1.5 py-1 text-xs font-semibold text-brand-red hover:bg-brand-red/10"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
