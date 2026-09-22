type Props = {
  years: number[]
  categories: string[]
  year: number | 'all'
  category: string | 'all'
  onYear: (y: number | 'all') => void
  onCategory: (c: string | 'all') => void
}

const base = 'inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-semibold transition'
const on = 'bg-brand-red text-white'
const off = 'bg-card text-ink ring-1 ring-line hover:bg-surface'

export default function FilterBar({
  years,
  categories,
  year,
  category,
  onYear,
  onCategory,
}: Props) {
  const showYears = years.length > 1
  const showCats = categories.length > 1
  if (!showYears && !showCats) return null

  return (
    <div className="mb-8 space-y-3">
      {showYears && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by year">
          <button
            type="button"
            onClick={() => onYear('all')}
            aria-pressed={year === 'all'}
            className={`${base} ${year === 'all' ? on : off}`}
          >
            All years
          </button>
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => onYear(y)}
              aria-pressed={year === y}
              className={`${base} ${year === y ? on : off}`}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      {showCats && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <button
            type="button"
            onClick={() => onCategory('all')}
            aria-pressed={category === 'all'}
            className={`${base} ${category === 'all' ? 'bg-navy text-white' : off}`}
          >
            All categories
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCategory(c)}
              aria-pressed={category === c}
              className={`${base} ${category === c ? 'bg-navy text-white' : off}`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
