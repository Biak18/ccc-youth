import { Link } from 'react-router-dom'

export default function Breadcrumb({
  parentLabel,
  parentTo,
  current,
}: {
  parentLabel: string
  parentTo: string
  current: string
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/70">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link to={parentTo} className="hover:text-white">
            {parentLabel}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="text-white" aria-current="page">
          {current}
        </li>
      </ol>
    </nav>
  )
}
