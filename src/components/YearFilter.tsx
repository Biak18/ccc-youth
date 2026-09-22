export default function YearFilter({
  years,
  active,
  onChange,
}: {
  years: number[]
  active: number | 'all'
  onChange: (year: number | 'all') => void
}) {
  if (years.length < 2) return null

  const base =
    'rounded-full px-4 py-2 text-sm font-semibold transition min-h-11 sm:min-h-0'
  const on = 'bg-brand-red text-white'
  const off = 'bg-white text-ink ring-1 ring-line hover:bg-surface'

  return (
    <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter by year">
      <button
        type="button"
        onClick={() => onChange('all')}
        aria-pressed={active === 'all'}
        className={`${base} ${active === 'all' ? on : off}`}
      >
        All years
      </button>
      {years.map((y) => (
        <button
          key={y}
          type="button"
          onClick={() => onChange(y)}
          aria-pressed={active === y}
          className={`${base} ${active === y ? on : off}`}
        >
          {y}
        </button>
      ))}
    </div>
  )
}
