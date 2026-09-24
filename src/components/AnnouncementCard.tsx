import { Link } from 'react-router-dom'
import type { Announcement } from '../types/db'
import { formatDate } from '../lib/format'

export default function AnnouncementCard({ item }: { item: Announcement }) {
  return (
    <article
      className={[
        'rounded-2xl border bg-card p-5 shadow-sm transition hover:shadow-md',
        item.isPinned ? 'border-gold/50 bg-gold/[0.06]' : 'border-line',
      ].join(' ')}
    >
      <div className="flex items-center gap-2">
        {item.isPinned && (
          <span className="rounded bg-gold px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-yellow-900">
            Pinned
          </span>
        )}
        {item.publishedAt && (
          <time className="text-xs font-medium text-muted" dateTime={item.publishedAt}>
            {formatDate(item.publishedAt)}
          </time>
        )}
      </div>
      <h3 className="mt-2 text-lg font-bold text-heading">
        <Link to={`/announcements/${item.slug}`} className="hover:text-link">
          {item.title}
        </Link>
      </h3>
      {item.content && <p className="mt-2 whitespace-pre-line text-sm text-ink/80">{item.content}</p>}
      <Link
        to={`/announcements/${item.slug}`}
        className="mt-3 inline-block text-sm font-semibold text-link hover:underline"
      >
        Read more
      </Link>
    </article>
  )
}
