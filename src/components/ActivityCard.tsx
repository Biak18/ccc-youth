import { Link } from 'react-router-dom'
import type { Activity } from '../types/db'
import { formatDate } from '../lib/format'
import CoverImage from './CoverImage'

export default function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-line bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/activities/${activity.slug}`} className="block">
        <div className="overflow-hidden">
          <CoverImage
            src={activity.cover_image_url}
            alt={activity.title}
            className="aspect-[4/3] transition duration-500 ease-out group-hover:scale-[1.06]"
          />
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold text-heading transition-colors group-hover:text-brand-red">
            {activity.title}
          </h3>
          {/* The real activity date, never the upload date */}
          <p className="mt-1 text-sm font-bold text-ember">
            {formatDate(activity.activity_date)}
          </p>
          {activity.location && (
            <p className="mt-1 text-sm text-muted">{activity.location}</p>
          )}
          {activity.description && (
            <p className="mt-3 line-clamp-3 text-sm text-ink/80">{activity.description}</p>
          )}
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-ember">
            View details
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              &rarr;
            </span>
          </span>
        </div>
      </Link>
    </article>
  )
}
