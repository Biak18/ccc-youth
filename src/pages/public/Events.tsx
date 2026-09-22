import PageHeader from '../../components/PageHeader'
import Seo from '../../components/Seo'
import Section from '../../components/Section'
import SectionHeading from '../../components/SectionHeading'
import EventCard from '../../components/EventCard'
import { CardSkeletons, EmptyState, ErrorState } from '../../components/States'
import { usePastEvents, useUpcomingEvents } from '../../hooks/useContent'

export default function Events() {
  const upcoming = useUpcomingEvents()
  const past = usePastEvents()

  return (
    <>
      <Seo
        title="Events"
        description="Upcoming Christian City Church Youth gatherings, studies and special programmes."
      />
      <PageHeader
        title="Events"
        subtitle="Upcoming Youth gatherings, studies and special programmes."
      />
      <Section>
        <SectionHeading title="Upcoming" />
        {upcoming.error ? (
          <ErrorState message={upcoming.error} />
        ) : upcoming.loading ? (
          <CardSkeletons />
        ) : upcoming.data?.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.data.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <EmptyState message="No upcoming events right now - check back soon." />
        )}
      </Section>

      {past.data && past.data.length > 0 && (
        <Section tinted>
          <SectionHeading title="Past Events" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {past.data.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </Section>
      )}
    </>
  )
}
