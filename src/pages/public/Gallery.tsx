import PageHeader from '../../components/PageHeader'
import Section from '../../components/Section'
import { EmptyState } from '../../components/States'

export default function Gallery() {
  return (
    <>
      <PageHeader title="Gallery" subtitle="Photos and videos from our Youth activities." />
      <Section>
        <EmptyState message="The photo gallery and lightbox arrive in Phase 3, once activity media is uploaded." />
      </Section>
    </>
  )
}
