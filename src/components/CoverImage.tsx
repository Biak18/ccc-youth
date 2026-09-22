/**
 * Real cover photo when there is one, otherwise a branded placeholder
 * so the layout never looks broken before photos are uploaded.
 */
export default function CoverImage({
  src,
  alt,
  className = 'aspect-[4/3]',
}: {
  src?: string | null
  alt: string
  className?: string
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
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
