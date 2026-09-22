import { Link } from 'react-router-dom'

export default function SectionHeading({
  title,
  subtitle,
  linkTo,
  linkLabel = 'View all',
}: {
  title: string
  subtitle?: string
  linkTo?: string
  linkLabel?: string
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-muted">{subtitle}</p>}
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className="text-sm font-semibold text-brand-red hover:text-brand-red-dark"
        >
          {linkLabel} &rarr;
        </Link>
      )}
    </div>
  )
}
