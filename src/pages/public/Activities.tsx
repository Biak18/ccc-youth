import { useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import Section from '../../components/Section'
import ActivityCard from '../../components/ActivityCard'
import YearFilter from '../../components/YearFilter'
import { CardSkeletons, EmptyState, ErrorState } from '../../components/States'
import { useActivities } from '../../hooks/useContent'
import { getYear } from '../../lib/format'

export default function Activities() {
  const { data, loading, error } = useActivities(100)
  const [params, setParams] = useSearchParams()

  const yearParam = params.get('year')
  const active: number | 'all' = yearParam ? Number(yearParam) : 'all'

  const rows = data ?? []
  const years = [...new Set(rows.map((a) => getYear(a.activity_date)))].sort((a, b) => b - a)
  const visible = active === 'all' ? rows : rows.filter((a) => getYear(a.activity_date) === active)

  const setYear = (y: number | 'all') => {
    if (y === 'all') setParams({}, { replace: true })
    else setParams({ year: String(y) }, { replace: true })
  }

  return (
    <>
      <PageHeader title="Activities" subtitle="What our Youth has been doing together." />
      <Section>
        {error ? (
          <ErrorState message={error} />
        ) : loading ? (
          <CardSkeletons count={6} />
        ) : rows.length ? (
          <>
            <YearFilter years={years} active={active} onChange={setYear} />
            {visible.length ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((a) => (
                  <ActivityCard key={a.id} activity={a} />
                ))}
              </div>
            ) : (
              <EmptyState message={`No activities from ${active}.`} />
            )}
          </>
        ) : (
          <EmptyState message="No activities published yet." />
        )}
      </Section>
    </>
  )
}
