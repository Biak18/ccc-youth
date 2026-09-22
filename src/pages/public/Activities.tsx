import PageHeader from '../../components/PageHeader'
import Section from '../../components/Section'
import ActivityCard from '../../components/ActivityCard'
import FilterBar from '../../components/FilterBar'
import Seo from '../../components/Seo'
import { CardSkeletons, EmptyState, ErrorState } from '../../components/States'
import { useActivities } from '../../hooks/useContent'
import { useActivityFilters } from '../../hooks/useFilters'

export default function Activities() {
  const { data, loading, error } = useActivities(100)
  const rows = data ?? []
  const f = useActivityFilters(rows)

  return (
    <>
      <Seo
        title="Activities"
        description="Photos and stories from Christian City Church Youth activities."
      />
      <PageHeader title="Activities" subtitle="What our Youth has been doing together." />
      <Section>
        {error ? (
          <ErrorState message={error} />
        ) : loading ? (
          <CardSkeletons count={6} />
        ) : rows.length ? (
          <>
            <FilterBar
              years={f.years}
              categories={f.categories}
              year={f.year}
              category={f.category}
              onYear={f.setYear}
              onCategory={f.setCategory}
            />
            {f.visible.length ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {f.visible.map((a) => (
                  <ActivityCard key={a.id} activity={a} />
                ))}
              </div>
            ) : (
              <EmptyState message="No activities match these filters." />
            )}
          </>
        ) : (
          <EmptyState message="No activities published yet." />
        )}
      </Section>
    </>
  )
}
