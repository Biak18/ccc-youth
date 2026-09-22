import { Link } from 'react-router-dom'
import type { EventRow } from '../types/db'
import { formatDate, formatDayTime } from '../lib/format'
import CoverImage from './CoverImage'

export default function NextEventCard({ event }: { event: EventRow }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm md:grid md:grid-cols-2">
      <Link to={`/events/${event.slug}`} className="block md:h-full">
        <CoverImage
          src={event.cover_image_url}
          alt={event.title}
          className="aspect-[16/10] md:h-full md:aspect-auto"
        />
      </Link>
      <div className="p-6 sm:p-8">
        <span className="inline-flex rounded-full bg-brand-red/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-red">
          Next Event
        </span>
        <h3 className="mt-4 text-2xl font-bold text-navy sm:text-3xl">
          <Link to={`/events/${event.slug}`} className="hover:text-brand-red">
            {event.title}
          </Link>
        </h3>
        <dl className="mt-4 space-y-1 text-sm text-ink/80">
          <dt className="sr-only">Date</dt>
          <dd className="font-semibold text-ink">{formatDate(event.start_date)}</dd>
          <dt className="sr-only">Time</dt>
          <dd>{formatDayTime(event.start_date)}</dd>
          {event.location && (
            <>
              <dt className="sr-only">Location</dt>
              <dd>{event.location}</dd>
            </>
          )}
        </dl>
        {event.description && <p className="mt-4 text-ink/80">{event.description}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={`/events/${event.slug}`}
            className="inline-flex rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-navy-dark"
          >
            View Event
          </Link>
          {event.registration_url && (
            <a
              href={event.registration_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-lg bg-brand-red px-5 py-3 text-sm font-semibold text-white hover:bg-brand-red-dark"
            >
              Register
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
