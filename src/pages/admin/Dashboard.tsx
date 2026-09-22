import { Link } from 'react-router-dom'
import { useAllActivities, useDashboardStats } from '../../hooks/useAdminData'
import { formatShort } from '../../lib/format'
import { AdminHeader, StatusBadge } from '../../components/admin/AdminUI'
import { useAuth } from '../../hooks/useAuth'

export default function Dashboard() {
  const stats = useDashboardStats()
  const { data: activities } = useAllActivities()
  const { profile } = useAuth()

  const cards = [
    { label: 'Activities', value: stats?.activities, to: '/admin/activities' },
    { label: 'Upcoming Events', value: stats?.upcomingEvents, to: '/admin/events' },
    { label: 'Drafts', value: stats?.drafts, to: '/admin/activities?status=draft' },
    { label: 'Photos', value: stats?.photos },
    { label: 'Videos', value: stats?.videos },
  ]

  const quick = [
    { to: '/admin/activities/new', label: '+ New Activity' },
    { to: '/admin/events/new', label: '+ New Event' },
    { to: '/admin/announcements/new', label: '+ New Announcement' },
  ]

  return (
    <>
      <AdminHeader
        title={`Welcome${profile?.display_name ? `, ${profile.display_name}` : ''}`}
        subtitle="Create and manage Youth content."
      />

      <div className="flex flex-wrap gap-3">
        {quick.map((q) => (
          <Link
            key={q.to}
            to={q.to}
            className="rounded-lg bg-brand-red px-5 py-3 text-sm font-semibold text-white hover:bg-brand-red-dark"
          >
            {q.label}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => {
          const inner = (
            <>
              <p className="text-3xl font-bold text-heading">{c.value ?? '-'}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">
                {c.label}
              </p>
            </>
          )
          return c.to ? (
            <Link
              key={c.label}
              to={c.to}
              className="rounded-xl bg-card p-5 shadow-sm ring-1 ring-line hover:ring-skyblue"
            >
              {inner}
            </Link>
          ) : (
            <div key={c.label} className="rounded-xl bg-card p-5 shadow-sm ring-1 ring-line">
              {inner}
            </div>
          )
        })}
      </div>

      <h2 className="mt-12 text-lg font-bold text-heading">Recent Activities</h2>
      <div className="mt-4 overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-line">
        {activities?.length ? (
          <ul className="divide-y divide-line">
            {activities.slice(0, 6).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <Link
                  to={`/admin/activities/${a.id}/edit`}
                  className="min-w-0 flex-1 truncate text-sm font-medium text-heading hover:text-brand-red"
                >
                  {a.title}
                </Link>
                <span className="shrink-0 text-sm text-muted">
                  {formatShort(a.activity_date)}
                </span>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-muted">
            No activities yet.{' '}
            <Link to="/admin/activities/new" className="font-semibold text-brand-red">
              Create the first one
            </Link>
            .
          </p>
        )}
      </div>
    </>
  )
}
