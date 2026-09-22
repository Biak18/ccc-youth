import { Link } from 'react-router-dom'
import heroPhoto from '../assets/images/youth-group.jpg'
import logo from '../assets/logo/church-logo.png'
import { site } from '../site'
import { useSiteSettings } from '../hooks/useContent'

export default function Hero() {
  const { data } = useSiteSettings()
  const heroSrc = data?.hero_image_url || heroPhoto
  const tagline = data?.tagline ?? site.tagline

  return (
    <section className="relative isolate min-h-[560px] overflow-hidden md:min-h-[640px]">
      <img
        src={heroSrc}
        alt="Christian City Church Youth group"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
      />
      {/* Dark overlay keeps the text readable over the photograph */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-dark/80 via-navy/60 to-navy-dark/85"
      />

      <div className="mx-auto flex min-h-[560px] max-w-6xl flex-col justify-center px-4 py-20 md:min-h-[640px]">
        <img src={logo} alt="" aria-hidden="true" className="h-16 w-auto md:h-20" />
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-white/80 md:text-base">
          {data?.church_name ?? site.churchName}
        </p>
        <h1 className="mt-1 text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
          Youth
        </h1>
        <p className="mt-4 max-w-xl text-lg text-white/90 md:text-xl">{tagline}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/events"
            className="inline-flex items-center justify-center rounded-lg bg-brand-red px-6 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-brand-red-dark"
          >
            Upcoming Events
          </Link>
          <Link
            to="/activities"
            className="inline-flex items-center justify-center rounded-lg border border-white/70 bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            Explore Activities
          </Link>
        </div>
      </div>
    </section>
  )
}
