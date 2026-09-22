import { useState } from 'react'
import type { Media } from '../types/db'
import Lightbox, { type LightboxItem } from './Lightbox'

/**
 * Responsive, lazy-loaded photo grid with lightbox preview.
 */
export default function PhotoGrid({
  photos,
  altPrefix,
}: {
  photos: Media[]
  altPrefix: string
}) {
  const [index, setIndex] = useState<number | null>(null)

  const items: LightboxItem[] = photos.map((p, i) => ({
    url: p.url,
    alt: p.title ?? `${altPrefix} photo ${i + 1}`,
    caption: p.title ?? p.description,
  }))

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="group block w-full overflow-hidden rounded-lg bg-surface"
              aria-label={`Open photo ${i + 1} of ${photos.length}`}
            >
              <img
                src={p.thumbnail_url || p.url}
                alt={p.title ?? `${altPrefix} photo ${i + 1}`}
                loading="lazy"
                className="aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
            </button>
          </li>
        ))}
      </ul>

      <Lightbox
        items={items}
        index={index}
        onClose={() => setIndex(null)}
        onNavigate={setIndex}
      />
    </>
  )
}
