import PageHeader from '../../components/PageHeader'
import Section from '../../components/Section'
import ActivityCard from '../../components/ActivityCard'
import { CardSkeletons, EmptyState, ErrorState } from '../../components/States'
import { useActivities } from '../../hooks/useContent'

export default function Activities() {
  const { data, loading, error } = useActivities()

  return (
    <>
      <PageHeader title="Activities" subtitle="What our Youth has been doing together." />
      <Section>
        {error ? (
          <ErrorState message={error} />
        ) : loading ? (
          <CardSkeletons count={6} />
        ) : data?.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((a) => (
              <ActivityCard key={a.id} activity={a} />
            ))}
          </div>
        ) : (
          <EmptyState message="No activities published yet." />
        )}
      </Section>
    </>
  )
}
