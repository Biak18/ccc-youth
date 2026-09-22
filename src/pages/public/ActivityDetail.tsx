import { Link, useParams } from 'react-router-dom'
import Section from '../../components/Section'
import PhotoGrid from '../../components/PhotoGrid'
import VideoEmbed from '../../components/VideoEmbed'
import Breadcrumb from '../../components/Breadcrumb'
import CoverImage from '../../components/CoverImage'
import ArchivedBadge from '../../components/ArchivedBadge'
import { EmptyState, ErrorState } from '../../components/States'
import { formatDate } from '../../lib/format'
import { splitMedia, useActivityBySlug, useActivityMedia } from '../../hooks/useContent'
import NotFound from './NotFound'

export default function ActivityDetail() {
  const { slug } = useParams()
  const { data: activity, loading, error } = useActivityBySlug(slug)
  const media = useActivityMedia(activity?.id)
  const { photos, videos } = splitMedia(media.data)

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

  if (!activity) return <NotFound />

  return (
    <>
      <div className="bg-navy">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <Breadcrumb parentLabel="Activities" parentTo="/activities" current={activity.title} />
          {activity.status === 'archived' && <ArchivedBadge />}
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {activity.title}
          </h1>
          <p className="mt-3 font-semibold text-white/90">
            {formatDate(activity.activity_date)}
          </p>
          {activity.location && <p className="text-white/70">{activity.location}</p>}
        </div>
      </div>

      <Section>
        {activity.cover_image_url && (
          <CoverImage
            src={activity.cover_image_url}
            alt={activity.title}
            className="mb-8 aspect-[16/9] rounded-2xl"
          />
        )}

        {activity.description && (
          <p className="max-w-3xl whitespace-pre-line text-lg leading-relaxed text-ink/85">
            {activity.description}
          </p>
        )}

        <div className="mt-12">
          <h2 className="mb-5 text-2xl font-bold text-navy">Photos</h2>
          {media.loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-lg bg-surface" />
              ))}
            </div>
          ) : photos.length ? (
            <PhotoGrid photos={photos} altPrefix={activity.title} />
          ) : (
            <EmptyState message="No photos have been added to this activity yet." />
          )}
        </div>

        {videos.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-5 text-2xl font-bold text-navy">Videos</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {videos.map((v) => (
                <VideoEmbed key={v.id} video={v} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-14 flex flex-wrap gap-3 border-t border-line pt-8">
          <Link
            to="/activities"
            className="inline-flex rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-navy-dark"
          >
            All activities
          </Link>
          <Link
            to="/memories"
            className="inline-flex rounded-lg px-5 py-3 text-sm font-semibold text-navy ring-1 ring-line hover:bg-surface"
          >
            Youth Memories
          </Link>
        </div>
      </Section>
    </>
  )
}
