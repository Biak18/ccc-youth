/**
 * Real cover photo when there is one, otherwise a branded placeholder
 * so the layout never looks broken before photos are uploaded.
 *
 * When a thumbnail exists, small screens download the 480px version
 * instead of the full-size image.
 */
export default function CoverImage({
  src,
  thumbnail,
  alt,
  className = 'aspect-[4/3]',
  eager = false,
}: {
  src?: string | null
  thumbnail?: string | null
  alt: string
  className?: string
  eager?: boolean
}) {
  if (src) {
    return (
      <img
        src={src}
        srcSet={thumbnail ? `${thumbnail} 480w, ${src} 1920w` : undefined}
        sizes={thumbnail ? '(max-width: 640px) 100vw, 640px' : undefined}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={`w-full object-cover ${className}`}
      />
    )
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex w-full items-center justify-center bg-gradient-to-br from-navy to-skyblue ${className}`}
    >
      <span className="text-sm font-semibold uppercase tracking-widest text-white/70">
        CCC Youth
      </span>
    </div>
  )
}
