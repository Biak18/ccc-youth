import { Link } from 'react-router-dom'
import type { Activity } from '../types/db'
import { formatDate } from '../lib/format'
import CoverImage from './CoverImage'

export default function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-line bg-white shadow-sm transition hover:shadow-md">
      <Link to={`/activities/${activity.slug}`} className="block">
        <CoverImage src={activity.cover_image_url} alt={activity.title} />
        <div className="p-5">
          {activity.category && (
            <span className="mb-2 inline-flex rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-navy ring-1 ring-line">
              {activity.category}
            </span>
          )}
          <h3 className="text-lg font-bold text-navy group-hover:text-brand-red">
            {activity.title}
          </h3>
          {/* The real activity date, never the upload date */}
          <p className="mt-1 text-sm font-medium text-brand-red">
            {formatDate(activity.activity_date)}
          </p>
          {activity.location && (
            <p className="mt-1 text-sm text-muted">{activity.location}</p>
          )}
          {activity.description && (
            <p className="mt-3 line-clamp-3 text-sm text-ink/80">{activity.description}</p>
          )}
        </div>
      </Link>
    </article>
  )
}
