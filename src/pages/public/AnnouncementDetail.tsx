import { Link, useParams } from 'react-router-dom'
import Section from '../../components/Section'
import Seo from '../../components/Seo'
import Breadcrumb from '../../components/Breadcrumb'
import CoverImage from '../../components/CoverImage'
import { ErrorState } from '../../components/States'
import { formatDate } from '../../lib/format'
import { useAnnouncementBySlug } from '../../hooks/useContent'
import NotFound from './NotFound'

export default function AnnouncementDetail() {
  const { slug } = useParams()
  const { data: item, loading, error } = useAnnouncementBySlug(slug)

  if (loading) {
    return (
      <>
        <div className="h-52 animate-pulse bg-navy" />
        <Section>
          <div className="h-6 w-1/2 animate-pulse rounded bg-surface" />
        </Section>
      </>
    )
  }

  if (error) {
    return (
      <Section>
        <ErrorState message={error} />
      </Section>
    )
  }

  if (!item) return <NotFound />

  return (
    <>
      <Seo
        title={item.title}
        description={item.content?.slice(0, 160) ?? `${item.title} — Christian City Church Youth announcement.`}
        image={item.coverImageUrl}
        type="article"
      />
      <div className="bg-navy">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <Breadcrumb parentLabel="Announcements" parentTo="/announcements" current={item.title} />
          <div className="flex flex-wrap items-center gap-2">
            {item.isPinned && (
              <span className="inline-flex rounded-full bg-brand-red px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                Pinned
              </span>
            )}
            {item.publishedAt && (
              <time className="text-sm font-medium text-white/70" dateTime={item.publishedAt}>
                {formatDate(item.publishedAt)}
              </time>
            )}
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {item.title}
          </h1>
        </div>
      </div>

      <Section>
        <div className="max-w-3xl">
          {item.coverImageUrl && (
            <CoverImage
              src={item.coverImageUrl}
              alt={item.title}
              className="mb-8 aspect-[16/9] rounded-2xl"
            />
          )}
          {item.content && (
            <p className="whitespace-pre-line text-lg leading-relaxed text-ink/85">
              {item.content}
            </p>
          )}
          <div className="mt-10 border-t border-line pt-8">
            <Link
              to="/announcements"
              className="inline-flex rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-navy-dark"
            >
              All announcements
            </Link>
          </div>
        </div>
      </Section>
    </>
  )
}
