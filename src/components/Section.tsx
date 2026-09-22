import type { ReactNode } from 'react'

export default function Section({
  children,
  tinted = false,
}: {
  children: ReactNode
  tinted?: boolean
}) {
  return (
    <section className={tinted ? 'bg-surface py-16 sm:py-20' : 'py-16 sm:py-20'}>
      <div className="mx-auto max-w-6xl px-4">{children}</div>
    </section>
  )
}
