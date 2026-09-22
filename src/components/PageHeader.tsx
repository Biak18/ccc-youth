export default function PageHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="bg-navy">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        {subtitle && <p className="mt-3 max-w-2xl text-white/80">{subtitle}</p>}
      </div>
    </div>
  )
}
