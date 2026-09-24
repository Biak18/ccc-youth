import { site } from '../site'
import { useSiteSettings } from '../hooks/useContent'

export default function FacebookCTA() {
  const { data } = useSiteSettings()
  const url = data?.facebookUrl ?? site.facebookUrl

  return (
    <section className="bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-2xl bg-navy px-4 py-16 text-center sm:py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Stay Connected</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80">
              Follow {data?.churchName ?? site.churchName} on Facebook for announcements and
              regular updates.
            </p>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-6 py-3.5 text-base font-semibold text-navy hover:bg-white/90"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.3-1.5 1.6-1.5h1.6V4.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.3H7.6V14h2.3v8h3.6z" />
              </svg>
              Follow on Facebook
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
