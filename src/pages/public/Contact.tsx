import PageHeader from '../../components/PageHeader'
import Section from '../../components/Section'
import { useSiteSettings } from '../../hooks/useContent'
import { site } from '../../site'

export default function Contact() {
  const { data } = useSiteSettings()
  const address = data?.address ?? site.address
  const phone = data?.phone ?? site.phone
  const email = data?.email ?? site.email
  const facebook = data?.facebook_url ?? site.facebookUrl

  return (
    <>
      <PageHeader title="Contact" subtitle="We would love to hear from you." />
      <Section>
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-navy">
              {data?.church_name ?? site.churchName}
            </h2>
            <dl className="mt-4 space-y-3 text-ink/85">
              {address && (
                <div>
                  <dt className="text-sm font-semibold text-muted">Address</dt>
                  <dd>{address}</dd>
                </div>
              )}
              {phone && (
                <div>
                  <dt className="text-sm font-semibold text-muted">Phone</dt>
                  <dd>
                    <a className="hover:text-navy" href={`tel:${phone}`}>
                      {phone}
                    </a>
                  </dd>
                </div>
              )}
              {email && (
                <div>
                  <dt className="text-sm font-semibold text-muted">Email</dt>
                  <dd>
                    <a className="hover:text-navy" href={`mailto:${email}`}>
                      {email}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
          <div className="rounded-xl bg-surface p-6">
            <h2 className="text-xl font-bold text-navy">Follow us</h2>
            <p className="mt-2 text-ink/80">
              Our Facebook page has frequent updates and community posts.
            </p>
            <a
              href={facebook}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-navy-dark"
            >
              Follow on Facebook
            </a>
          </div>
        </div>
      </Section>
    </>
  )
}
