import PageHeader from '../../components/PageHeader'
import Section from '../../components/Section'
import ActivityCard from '../../components/ActivityCard'
import { CardSkeletons, EmptyState } from '../../components/States'
import { groupByYear, useActivities } from '../../hooks/useContent'

export default function Memories() {
  const { data, loading } = useActivities(100)
  const years = groupByYear(data ?? [])

  return (
    <>
      <PageHeader title="Youth Memories" subtitle="Our Youth archive, year by year." />
      <Section>
        {loading ? (
          <CardSkeletons count={6} />
        ) : years.length ? (
          <div className="space-y-14">
            {years.map(([year, rows]) => (
              <div key={year}>
                <h2 className="mb-5 border-b border-line pb-2 text-2xl font-bold text-navy">
                  {year}
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rows.map((a) => (
                    <ActivityCard key={a.id} activity={a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="The archive will fill up as activities are published." />
        )}
      </Section>
    </>
  )
}
