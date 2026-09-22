import { useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import Section from '../../components/Section'
import ActivityCard from '../../components/ActivityCard'
import YearFilter from '../../components/YearFilter'
import { CardSkeletons, EmptyState } from '../../components/States'
import { groupByYear, useArchive } from '../../hooks/useContent'
import { getYear } from '../../lib/format'

export default function Memories() {
  const { data, loading } = useArchive()
  const [params, setParams] = useSearchParams()

  const yearParam = params.get('year')
  const active: number | 'all' = yearParam ? Number(yearParam) : 'all'

  const rows = data ?? []
  const years = [...new Set(rows.map((a) => getYear(a.activity_date)))].sort((a, b) => b - a)
  const visible = active === 'all' ? rows : rows.filter((a) => getYear(a.activity_date) === active)
  const grouped = groupByYear(visible)

  const setYear = (y: number | 'all') => {
    if (y === 'all') setParams({}, { replace: true })
    else setParams({ year: String(y) }, { replace: true })
  }

  return (
    <>
      <PageHeader
        title="Youth Memories"
        subtitle="Our Youth archive, year by year. It becomes more valuable as the years pass."
      />
      <Section>
        {loading ? (
          <CardSkeletons count={6} />
        ) : rows.length ? (
          <>
            <YearFilter years={years} active={active} onChange={setYear} />
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
          </>
        ) : (
          <EmptyState message="The archive will fill up as activities are published." />
        )}
      </Section>
    </>
  )
}
