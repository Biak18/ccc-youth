import PageHeader from '../../components/PageHeader'
import Section from '../../components/Section'
import SectionHeading from '../../components/SectionHeading'
import PhotoGrid from '../../components/PhotoGrid'
import VideoCard from '../../components/VideoCard'
import { EmptyState, ErrorState } from '../../components/States'
import { useAllImages, useLatestVideos } from '../../hooks/useContent'

export default function Gallery() {
  const images = useAllImages()
  const videos = useLatestVideos(12)

  return (
    <>
      <PageHeader title="Gallery" subtitle="Photos and videos from our Youth activities." />

      <Section>
        <SectionHeading title="Photos" />
        {images.error ? (
          <ErrorState message={images.error} />
        ) : images.loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-lg bg-surface" />
            ))}
          </div>
        ) : images.data?.length ? (
          <PhotoGrid photos={images.data} altPrefix="Youth" />
        ) : (
          <EmptyState message="No photos uploaded yet." />
        )}
      </Section>

      {videos.data && videos.data.length > 0 && (
        <Section tinted>
          <SectionHeading title="Videos" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.data.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </Section>
      )}
    </>
  )
}
