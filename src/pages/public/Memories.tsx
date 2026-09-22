import PageHeader from '../../components/PageHeader'
import Section from '../../components/Section'
import ActivityCard from '../../components/ActivityCard'
import FilterBar from '../../components/FilterBar'
import Seo from '../../components/Seo'
import { CardSkeletons, EmptyState } from '../../components/States'
import { groupByYear, useArchive } from '../../hooks/useContent'
import { useActivityFilters } from '../../hooks/useFilters'

export default function Memories() {
  const { data, loading } = useArchive()
  const rows = data ?? []
  const f = useActivityFilters(rows)
  const grouped = groupByYear(f.visible)

  return (
    <>
      <Seo
        title="Youth Memories"
        description="The Christian City Church Youth archive, year by year."
      />
      <PageHeader
        title="Youth Memories"
        subtitle="Our Youth archive, year by year. It becomes more valuable as the years pass."
      />
      <Section>
        {loading ? (
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
            {grouped.length ? (
              <div className="space-y-14">
                {grouped.map(([year, items]) => (
                  <div key={year}>
                    <h2
                      id={`year-${year}`}
                      className="mb-5 border-b border-line pb-2 text-2xl font-bold text-navy"
                    >
                      {year}
                      <span className="ml-3 text-sm font-medium text-muted">
                        {items.length} {items.length === 1 ? 'activity' : 'activities'}
                      </span>
                    </h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((a) => (
                        <ActivityCard key={a.id} activity={a} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No activities match these filters." />
            )}
          </>
        ) : (
          <EmptyState message="The archive will fill up as activities are published." />
        )}
      </Section>
    </>
  )
}
