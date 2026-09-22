import { Link } from 'react-router-dom'
import logo from '../assets/logo/church-logo.png'
import { site, navLinks } from '../site'
import { useSiteSettings } from '../hooks/useContent'

export default function Footer() {
  const { data } = useSiteSettings()
  const address = data?.address ?? site.address
  const phone = data?.phone ?? site.phone
  const email = data?.email ?? site.email
  const facebook = data?.facebook_url ?? site.facebookUrl

  return (
    <footer className="mt-20 bg-navy text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt={`${site.churchName} logo`}
              className="h-12 w-auto rounded bg-white/90 p-1"
            />
            <div className="leading-tight">
              <p className="font-bold">{data?.church_name ?? site.churchName}</p>
              <p className="text-sm text-white/70">Youth Ministry</p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm text-white/70">
            {data?.tagline ?? site.tagline}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
            Explore
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-white/85 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
            Contact
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-white/85">
            {address && <li>{address}</li>}
            {phone && <li>{phone}</li>}
            {email && (
              <li>
                <a className="hover:text-white" href={`mailto:${email}`}>
                  {email}
                </a>
              </li>
            )}
          </ul>
          <a
            href={facebook}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex rounded-md bg-white px-4 py-2 text-sm font-semibold text-navy hover:bg-white/90"
          >
            Follow on Facebook
          </a>
        </div>
      </div>

      <div className="border-t border-white/15 py-5 text-center text-xs text-white/60">
        &copy; {new Date().getFullYear()} {site.churchName} Youth. All rights reserved.
      </div>
    </footer>
  )
}
