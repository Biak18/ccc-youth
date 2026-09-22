import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-28 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-brand-red">404</p>
      <h1 className="mt-3 text-3xl font-extrabold text-heading">Page not found</h1>
      <p className="mt-3 text-muted">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-navy-dark"
      >
        Back to Home
      </Link>
    </div>
  )
}
