import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import fallbackPhoto from '../assets/images/youth-group.jpg'
import { site } from '../site'
import { useSiteSettings } from '../hooks/useContent'

/** How long each photo stays on screen. */
const INTERVAL_MS = 1500

/**
 * Any file named youth-group*.jpg|jpeg|png|webp in src/assets/images is
 * picked up automatically, so you can add or remove hero photos by
 * dropping files in that folder without touching this file.
 */
const bundled = import.meta.glob<string>(
  '../assets/images/youth-group*.{jpg,jpeg,png,webp}',
  { eager: true, query: '?url', import: 'default' },
)
const bundledHeroes = [
  ...new Set([...Object.keys(bundled).sort().map((k) => bundled[k]), fallbackPhoto]),
]

export default function Hero() {
  const { data } = useSiteSettings()

  // Images managed in Site Settings win; otherwise use the bundled photos.
  const fromDb = (data?.heroImages ?? []).filter(Boolean)
  const images = fromDb.length > 0 ? fromDb : bundledHeroes

  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const timer = useRef<number | null>(null)

  const go = useCallback(
    (next: number) => setIndex(((next % images.length) + images.length) % images.length),
    [images.length],
  )

  // Respect the visitor's reduced-motion setting.
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (paused || reduceMotion || images.length < 2) return
    timer.current = window.setInterval(
      () => setIndex((i) => (i + 1) % images.length),
      INTERVAL_MS,
    )
    return () => {
      if (timer.current) window.clearInterval(timer.current)
    }
  }, [paused, reduceMotion, images.length])

  // Drag with mouse, touch, or pen. Pointer Events unify all three, and
  // `touch-pan-y` lets vertical page scrolls pass through to the browser
  // while horizontal drags come to us.
  const dragX = useRef<number | null>(null)
  const onPointerDown = (e: React.PointerEvent) => {
    dragX.current = e.clientX
    setPaused(true)
  }
  const endDrag = (e: React.PointerEvent) => {
    if (dragX.current !== null) {
      const dx = e.clientX - dragX.current
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1))
    }
    dragX.current = null
    // Mouse pause is owned by the hover handlers; touch/pen have no hover.
    if (e.pointerType !== 'mouse') setPaused(false)
  }

  const tagline = data?.tagline ?? site.tagline
  const multi = images.length > 1

  return (
    <section
      className="relative isolate min-h-[480px] cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing md:min-h-[600px]"
      aria-roledescription="carousel"
      aria-label="Youth group photos"
      tabIndex={multi ? 0 : undefined}
      onKeyDown={(e) => {
        if (!multi) return
        if (e.key === 'ArrowRight') go(index + 1)
        if (e.key === 'ArrowLeft') go(index - 1)
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onPointerDown={onPointerDown}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {/* Horizontal track */}
      <div
        className="absolute inset-0 -z-10 flex h-full w-full transition-transform duration-700 ease-out motion-reduce:transition-none"
        style={{
          width: `${images.length * 100}%`,
          transform: `translateX(-${index * (100 / images.length)}%)`,
        }}
      >
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={
              i === 0
                ? 'Christian City Church Youth group'
                : `Christian City Church Youth group, photo ${i + 1}`
            }
            loading={i === 0 ? 'eager' : 'lazy'}
            fetchPriority={i === 0 ? 'high' : undefined}
            decoding="async"
            draggable={false}
            className="h-full w-full shrink-0 object-cover object-[center_30%]"
            style={{ width: `${100 / images.length}%` }}
          />
        ))}
      </div>

      {/* Dark overlay keeps the text readable over every photo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-dark/80 via-navy/60 to-navy-dark/85"
      />

      <div className="mx-auto flex min-h-[480px] max-w-6xl flex-col justify-center px-4 py-16 md:min-h-[600px] md:py-20">
        <h1>
          <span className="block text-sm font-semibold uppercase tracking-[0.2em] text-white/80 md:text-base">
            {data?.churchName ?? site.churchName}
          </span>
          <span className="mt-1 block text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
            Youth
          </span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-white/90 md:text-xl">{tagline}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/events"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-red px-6 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-brand-red-dark"
          >
            Upcoming Events
          </Link>
          <Link
            to="/activities"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-6 py-3.5 text-base font-semibold text-navy shadow-lg transition hover:bg-white/90"
          >
            Explore Activities
          </Link>
        </div>
      </div>

      {/* Prev / next arrows */}
      {multi && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Show previous photo"
            className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur transition hover:bg-black/50"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Show next photo"
            className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur transition hover:bg-black/50"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      {multi && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show photo ${i + 1} of ${images.length}`}
              aria-current={i === index}
              className="flex h-11 w-11 items-center justify-center"
            >
              <span
                aria-hidden="true"
                className={[
                  'h-3 w-3 rounded-full ring-1 ring-white/70 transition',
                  i === index ? 'scale-110 bg-white' : 'bg-white/30 hover:bg-white/60',
                ].join(' ')}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
