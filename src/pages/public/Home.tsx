import Hero from '../../components/Hero'
import Seo from '../../components/Seo'
import Section from '../../components/Section'
import SectionHeading from '../../components/SectionHeading'
import NextEventCard from '../../components/NextEventCard'
import ActivityCard from '../../components/ActivityCard'
import AnnouncementCard from '../../components/AnnouncementCard'
import VideoCard from '../../components/VideoCard'
import LeaderCard from '../../components/LeaderCard'
import FacebookCTA from '../../components/FacebookCTA'
import { CardSkeletons, EmptyState } from '../../components/States'
import {
  groupByYear,
  useActivities,
  useAnnouncements,
  useLatestVideos,
  useLeaders,
  useUpcomingEvents,
} from '../../hooks/useContent'

export default function Home() {
  const events = useUpcomingEvents(1)
  const activities = useActivities(12)
  const announcements = useAnnouncements(2)
  const leaders = useLeaders()
  const videos = useLatestVideos(3)

  const nextEvent = events.data?.[0]
  const latest = activities.data ?? []
  const years = groupByYear(latest).slice(0, 2)

  return (
    <>
      <Seo
        title="Christian City Church Youth"
        description="Growing Together in Faith & Fellowship. Events, activities, photos and memories of the Youth ministry of Christian City Church, Yangon."
      />
      {/* 1. Hero */}
      <Hero />

      {/* 2. Next Event */}
      <Section>
        <SectionHeading
          title="Next Event"
          subtitle="Join us at our next Youth gathering."
          linkTo="/events"
          linkLabel="All events"
        />
        {events.loading ? (
          <div className="h-48 animate-pulse rounded-2xl bg-surface" />
        ) : nextEvent ? (
          <NextEventCard event={nextEvent} />
        ) : (
          <EmptyState message="No upcoming events published yet." />
        )}
      </Section>

      {/* 3. Latest Activities */}
      <Section tinted>
        <SectionHeading
          title="Latest Activities"
          subtitle="What our Youth has been doing recently."
          linkTo="/activities"
        />
        {activities.loading ? (
          <CardSkeletons />
        ) : latest.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.slice(0, 3).map((a) => (
              <ActivityCard key={a.id} activity={a} />
            ))}
          </div>
        ) : (
          <EmptyState message="No activities published yet." />
        )}
      </Section>

      {/* 4. Latest Videos */}
      <Section>
        <SectionHeading title="Latest Videos" linkTo="/gallery" linkLabel="Gallery" />
        {videos.loading ? (
          <CardSkeletons />
        ) : videos.data?.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.data.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        ) : (
          <EmptyState message="No videos yet." />
        )}
      </Section>

      {/* 5. Youth Memories */}
      <Section tinted>
        <SectionHeading
          title="Youth Memories"
          subtitle="Our growing archive of Youth activities, year by year."
          linkTo="/memories"
        />
        {activities.loading ? (
          <CardSkeletons />
        ) : years.length ? (
          <div className="space-y-10">
            {years.map(([year, rows]) => (
              <div key={year}>
                <h3 className="mb-4 text-xl font-bold text-heading">{year}</h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rows.slice(0, 3).map((a) => (
                    <ActivityCard key={a.id} activity={a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="Memories will appear here as activities are published." />
        )}
      </Section>

      {/* 6. Announcements */}
      <Section>
        <SectionHeading title="Announcements" linkTo="/announcements" />
        {announcements.loading ? (
          <div className="h-32 animate-pulse rounded-xl bg-surface" />
        ) : announcements.data?.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {announcements.data.map((a) => (
              <AnnouncementCard key={a.id} item={a} />
            ))}
          </div>
        ) : (
          <EmptyState message="No announcements right now." />
        )}
      </Section>

      {/* 7. Youth Leaders */}
      <Section tinted>
        <SectionHeading title="Meet Our Youth Leaders" />
        {leaders.loading ? (
          <CardSkeletons />
        ) : leaders.data?.length ? (
          <div className="grid gap-8 sm:grid-cols-3">
            {leaders.data.map((l) => (
              <LeaderCard key={l.id} leader={l} />
            ))}
          </div>
        ) : (
          <EmptyState message="Leader profiles coming soon." />
        )}
      </Section>

      {/* 8. Facebook CTA */}
      <FacebookCTA />
    </>
  )
}
