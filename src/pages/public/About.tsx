import PageHeader from '../../components/PageHeader'
import Section from '../../components/Section'
import SectionHeading from '../../components/SectionHeading'
import LeaderCard from '../../components/LeaderCard'
import { EmptyState } from '../../components/States'
import { useLeaders, useSiteSettings } from '../../hooks/useContent'
import { site } from '../../site'

export default function About() {
  const { data } = useSiteSettings()
  const leaders = useLeaders()

  return (
    <>
      <PageHeader title="About Our Youth" subtitle={data?.tagline ?? site.tagline} />
      <Section>
        <div className="max-w-3xl space-y-4 text-lg text-ink/85">
          <p>
            The Youth ministry of {data?.church_name ?? site.churchName} is a community of
            young people growing together in faith, friendship and service.
          </p>
          <p>
            We gather regularly for worship, Bible study, fellowship and outreach. This
            website is our permanent home for events, activities, photos and memories.
          </p>
        </div>
      </Section>
      <Section tinted>
        <SectionHeading title="Meet Our Youth Leaders" />
        {leaders.data?.length ? (
          <div className="grid gap-8 sm:grid-cols-3">
            {leaders.data.map((l) => (
              <LeaderCard key={l.id} leader={l} />
            ))}
          </div>
        ) : (
          <EmptyState message="Leader profiles coming soon." />
        )}
      </Section>
    </>
  )
}
