import type { Announcement } from '../types/db'
import { formatDate } from '../lib/format'

export default function AnnouncementCard({ item }: { item: Announcement }) {
  return (
    <article
      className={[
        'rounded-2xl border bg-card p-5 shadow-sm',
        item.is_pinned ? 'border-brand-red/40 bg-brand-red/[0.03]' : 'border-line',
      ].join(' ')}
    >
      <div className="flex items-center gap-2">
        {item.is_pinned && (
          <span className="rounded bg-brand-red px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
            Pinned
          </span>
        )}
        {item.published_at && (
          <time className="text-xs font-medium text-muted" dateTime={item.published_at}>
            {formatDate(item.published_at)}
          </time>
        )}
      </div>
      <h3 className="mt-2 text-lg font-bold text-heading">{item.title}</h3>
      {item.content && <p className="mt-2 whitespace-pre-line text-sm text-ink/80">{item.content}</p>}
    </article>
  )
}
