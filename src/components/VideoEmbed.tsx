import type { Media } from '../types/db'
import { youtubeId } from '../lib/format'

/**
 * YouTube and external videos are embedded; uploaded files use the
 * native player. Keeping large videos on YouTube keeps storage and
 * bandwidth manageable (ARCHITECTURE.md section 6).
 */
export default function VideoEmbed({ video }: { video: Media }) {
  const id = video.source === 'youtube' ? youtubeId(video.url) : null

  return (
    <figure>
      <div className="overflow-hidden rounded-xl bg-black">
        {id ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            title={video.title ?? 'Youth video'}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="aspect-video w-full"
          />
        ) : (
          <video
            src={video.url}
            poster={video.thumbnailUrl ?? undefined}
            controls
            preload="metadata"
            className="aspect-video w-full"
          >
            Your browser cannot play this video.
          </video>
        )}
      </div>
      {video.title && (
        <figcaption className="mt-2 text-sm font-medium text-ink">{video.title}</figcaption>
      )}
    </figure>
  )
}
