import { Link } from 'react-router-dom'
import type { EventRow } from '../types/db'
import { formatDate, formatDayTime } from '../lib/format'
import CoverImage from './CoverImage'

export default function EventCard({ event }: { event: EventRow }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-line bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/events/${event.slug}`} className="block">
        <div className="overflow-hidden">
          <CoverImage
            src={event.cover_image_url}
            alt={event.title}
            className="aspect-[16/9] transition duration-500 ease-out group-hover:scale-[1.06]"
          />
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold text-heading transition-colors group-hover:text-brand-red">
            {event.title}
          </h3>
          <p className="mt-1 text-sm font-bold text-ember">
            {formatDate(event.start_date)}
          </p>
          <p className="text-sm text-muted">{formatDayTime(event.start_date)}</p>
          {event.location && <p className="mt-1 text-sm text-muted">{event.location}</p>}
          {event.description && (
            <p className="mt-3 line-clamp-2 text-sm text-ink/80">{event.description}</p>
          )}
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-ember">
            View details
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              &rarr;
            </span>
          </span>
        </div>
      </Link>
    </article>
  )
}
