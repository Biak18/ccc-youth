import type { EventRow } from '../types/db'
import { formatDate, formatDayTime } from '../lib/format'
import CoverImage from './CoverImage'

export default function EventCard({ event }: { event: EventRow }) {
  return (
    <article className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
      <CoverImage src={event.cover_image_url} alt={event.title} className="aspect-[16/9]" />
      <div className="p-5">
        <h3 className="text-lg font-bold text-navy">{event.title}</h3>
        <p className="mt-1 text-sm font-medium text-brand-red">
          {formatDate(event.start_date)}
        </p>
        <p className="text-sm text-muted">{formatDayTime(event.start_date)}</p>
        {event.location && <p className="mt-1 text-sm text-muted">{event.location}</p>}
        {event.description && (
          <p className="mt-3 line-clamp-2 text-sm text-ink/80">{event.description}</p>
        )}
      </div>
    </article>
  )
}
