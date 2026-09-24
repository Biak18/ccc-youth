import type { Media } from '../types/db'
import { formatDate, youtubeThumb } from '../lib/format'

export default function VideoCard({ video }: { video: Media }) {
  const thumb = video.thumbnailUrl || youtubeThumb(video.url)
  const title = video.title ?? 'Youth video'

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`Play video: ${title}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-video overflow-hidden bg-navy">
        {thumb && (
          <img
            src={thumb}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.06]"
          />
        )}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-red/90 text-white shadow-lg transition duration-300 group-hover:scale-110 group-hover:bg-brand-red">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-heading transition-colors group-hover:text-brand-red">
          {title}
        </h3>
        {video.createdAt && <p className="mt-1 text-sm text-muted">{formatDate(video.createdAt)}</p>}
      </div>
    </a>
  )
}
