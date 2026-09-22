export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center">
      <p className="text-muted">{message}</p>
    </div>
  )
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-brand-red/30 bg-brand-red/5 p-6 text-center">
      <p className="text-sm font-medium text-brand-red-dark">
        Could not load content: {message}
      </p>
    </div>
  )
}

export function CardSkeletons({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-line bg-card">
          <div className="aspect-[4/3] animate-pulse bg-surface" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-surface" />
            <div className="h-3 w-full animate-pulse rounded bg-surface" />
          </div>
        </div>
      ))}
    </div>
  )
}
