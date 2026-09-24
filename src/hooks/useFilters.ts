import { useSearchParams } from 'react-router-dom'
import type { Activity } from '../types/db'
import { getYear } from '../lib/format'

/**
 * Year and category filters kept in the URL, so filtered views are
 * shareable and the back button works.
 */
export function useActivityFilters(rows: Activity[]) {
  const [params, setParams] = useSearchParams()

  const yearParam = params.get('year')
  const catParam = params.get('category')
  const year: number | 'all' = yearParam ? Number(yearParam) : 'all'
  const category: string | 'all' = catParam ?? 'all'

  const years = [...new Set(rows.map((a) => getYear(a.activityDate)))].sort((a, b) => b - a)
  const categories = [...new Set(rows.map((a) => a.category).filter(Boolean) as string[])].sort()

  const visible = rows
    .filter((a) => year === 'all' || getYear(a.activityDate) === year)
    .filter((a) => category === 'all' || a.category === category)

  const update = (next: { year?: number | 'all'; category?: string | 'all' }) => {
    const y = next.year ?? year
    const c = next.category ?? category
    const q: Record<string, string> = {}
    if (y !== 'all') q.year = String(y)
    if (c !== 'all') q.category = c
    setParams(q, { replace: true })
  }

  return {
    years,
    categories,
    year,
    category,
    visible,
    setYear: (y: number | 'all') => update({ year: y }),
    setCategory: (c: string | 'all') => update({ category: c }),
  }
}
