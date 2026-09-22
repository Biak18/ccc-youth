import { format, parseISO, isAfter } from 'date-fns'

const toDate = (v: string | Date) => (typeof v === 'string' ? parseISO(v) : v)

/** "September 15, 2026" - always the real activity/event date. */
export const formatDate = (v: string | Date) => format(toDate(v), 'MMMM d, yyyy')

/** "Sunday - 4:00 PM" */
export const formatDayTime = (v: string | Date) => format(toDate(v), "EEEE '\u00b7' h:mm a")

/** "Sep 15" for compact cards. */
export const formatShort = (v: string | Date) => format(toDate(v), 'MMM d')

export const getYear = (v: string | Date) => toDate(v).getFullYear()

export const isUpcoming = (v: string | Date) => isAfter(toDate(v), new Date())

/** "Youth Camp 2026" -> "youth-camp-2026" */
export const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  )
  return m ? m[1] : null
}

export function youtubeThumb(url: string): string {
  const id = youtubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : ''
}
