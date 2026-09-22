import type { Media } from '../types/db'
import { formatDate, youtubeThumb } from '../lib/format'

export default function VideoCard({ video }: { video: Media }) {
  const thumb = video.thumbnail_url || youtubeThumb(video.url)

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noreferrer"
      className="group block overflow-hidden rounded-xl border border-line bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-video bg-navy">
        {thumb && <img src={thumb} alt="" loading="lazy" className="h-full w-full object-cover" />}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-red/90 text-white shadow-lg transition group-hover:scale-105">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-navy">{video.title ?? 'Youth video'}</h3>
        <p className="mt-1 text-sm text-muted">{formatDate(video.created_at)}</p>
      </div>
    </a>
  )
}
