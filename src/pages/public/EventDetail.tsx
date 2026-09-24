import { Link, useParams } from 'react-router-dom'
import Section from '../../components/Section'
import Seo from '../../components/Seo'
import Breadcrumb from '../../components/Breadcrumb'
import CoverImage from '../../components/CoverImage'
import ArchivedBadge from '../../components/ArchivedBadge'
import { ErrorState } from '../../components/States'
import { formatDate, formatDayTime, isUpcoming } from '../../lib/format'
import { useEventBySlug } from '../../hooks/useContent'
import NotFound from './NotFound'

export default function EventDetail() {
  const { slug } = useParams()
  const { data: event, loading, error } = useEventBySlug(slug)

  if (loading) {
    return (
      <>
        <div className="h-52 animate-pulse bg-navy" />
        <Section>
          <div className="h-6 w-1/2 animate-pulse rounded bg-surface" />
        </Section>
      </>
    )
  }

  if (error) {
    return (
      <Section>
        <ErrorState message={error} />
      </Section>
    )
  }

  if (!event) return <NotFound />

  const upcoming = isUpcoming(event.startDate)

  return (
    <>
      <Seo
        title={event.title}
        description={event.description ?? `${event.title} at Christian City Church Youth.`}
        image={event.coverImageUrl}
        type="article"
      />
      <div className="bg-navy">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <Breadcrumb parentLabel="Events" parentTo="/events" current={event.title} />
          <div className="flex flex-wrap items-center gap-2">
            {event.status === 'archived' && <ArchivedBadge />}
            <span className="inline-flex rounded-full bg-brand-red px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              {upcoming ? 'Upcoming' : 'Past event'}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {event.title}
          </h1>
        </div>
      </div>

      <Section>
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {event.coverImageUrl && (
              <CoverImage
                src={event.coverImageUrl}
                alt={event.title}
                className="mb-8 aspect-[16/9] rounded-2xl"
              />
            )}
            {event.description && (
              <p className="whitespace-pre-line text-lg leading-relaxed text-ink/85">
                {event.description}
              </p>
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="rounded-2xl bg-surface p-6">
              <h2 className="text-lg font-bold text-heading">Details</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="font-semibold text-muted">Date</dt>
                  <dd className="text-ink">{formatDate(event.startDate)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-muted">Time</dt>
                  <dd className="text-ink">{formatDayTime(event.startDate)}</dd>
                </div>
                {event.endDate && (
                  <div>
                    <dt className="font-semibold text-muted">Ends</dt>
                    <dd className="text-ink">{formatDate(event.endDate)}</dd>
                  </div>
                )}
                {event.location && (
                  <div>
                    <dt className="font-semibold text-muted">Location</dt>
                    <dd className="text-ink">{event.location}</dd>
                  </div>
                )}
                {event.contactInformation && (
                  <div>
                    <dt className="font-semibold text-muted">Contact</dt>
                    <dd className="whitespace-pre-line text-ink">
                      {event.contactInformation}
                    </dd>
                  </div>
                )}
              </dl>

              {event.registrationUrl && upcoming && (
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 block rounded-lg bg-brand-red px-5 py-3 text-center text-sm font-semibold text-white hover:bg-brand-red-dark"
                >
                  Register
                </a>
              )}
              <Link
                to="/events"
                className="mt-3 block rounded-lg bg-card px-5 py-3 text-center text-sm font-semibold text-heading ring-1 ring-line hover:bg-surface"
              >
                All events
              </Link>
            </div>
          </aside>
        </div>
      </Section>
    </>
  )
}
