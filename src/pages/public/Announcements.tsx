import PageHeader from '../../components/PageHeader'
import Section from '../../components/Section'
import AnnouncementCard from '../../components/AnnouncementCard'
import { EmptyState, ErrorState } from '../../components/States'
import { useAnnouncements } from '../../hooks/useContent'

export default function Announcements() {
  const { data, loading, error } = useAnnouncements()

  return (
    <>
      <PageHeader title="Announcements" subtitle="What you need to know." />
      <Section>
        {error ? (
          <ErrorState message={error} />
        ) : loading ? (
          <div className="h-32 animate-pulse rounded-xl bg-surface" />
        ) : data?.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {data.map((a) => (
              <AnnouncementCard key={a.id} item={a} />
            ))}
          </div>
        ) : (
          <EmptyState message="No announcements right now." />
        )}
      </Section>
    </>
  )
}
