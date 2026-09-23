import { useEffect, useState } from 'react'
import { inList, restQuery, type RestResult } from '../lib/rest'
import type {
  Activity,
  Announcement,
  EventRow,
  Media,
  SiteSettings,
  Status,
  YouthLeader,
} from '../types/db'

type Result<T> = { data: T | null; loading: boolean; error: string | null }

/**
 * Listing queries use status = 'published' so drafts never reach the
 * public site. Detail and archive queries also allow 'archived', which
 * stays readable for historical browsing but is kept out of the
 * current/featured sections.
 *
 * RLS enforces all of this again on the server.
 */
export function useQuery<T>(run: () => Promise<RestResult<T>>, deps: unknown[] = []): Result<T> {
  const [state, setState] = useState<Result<T>>({ data: null, loading: true, error: null })

  useEffect(() => {
    let active = true
    setState((s) => ({ ...s, loading: true }))
    run().then(({ data, error }) => {
      if (!active) return
      setState({ data: data ?? null, loading: false, error: error?.message ?? null })
    })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}

const PUBLIC: Status[] = ['published', 'archived']
const nowIso = () => new Date().toISOString()

/* ---------------------------------------------------------------- lists */

export const useSiteSettings = () =>
  useQuery<SiteSettings>(() =>
    restQuery('site_settings', { filters: { id: 'eq.1' }, single: true }),
  )

export const useUpcomingEvents = (limit = 12) =>
  useQuery<EventRow[]>(
    () =>
      restQuery('events', {
        filters: { status: 'eq.published', start_date: `gte.${nowIso()}` },
        order: 'start_date.asc',
        limit,
      }),
    [limit],
  )

export const usePastEvents = (limit = 12) =>
  useQuery<EventRow[]>(
    () =>
      restQuery('events', {
        filters: { status: inList(PUBLIC), start_date: `lt.${nowIso()}` },
        order: 'start_date.desc',
        limit,
      }),
    [limit],
  )

export const useActivities = (limit = 24) =>
  useQuery<Activity[]>(
    () =>
      restQuery('activities', {
        filters: { status: 'eq.published' },
        order: 'activity_date.desc',
        limit,
      }),
    [limit],
  )

/** The long-term archive: published + archived, newest first. */
export const useArchive = (limit = 200) =>
  useQuery<Activity[]>(
    () =>
      restQuery('activities', {
        filters: { status: inList(PUBLIC) },
        order: 'activity_date.desc',
        limit,
      }),
    [limit],
  )

export const useAnnouncements = (limit = 20) =>
  useQuery<Announcement[]>(
    () =>
      restQuery('announcements', {
        filters: { status: 'eq.published' },
        order: 'is_pinned.desc,published_at.desc',
        limit,
      }),
    [limit],
  )

export const useLeaders = () =>
  useQuery<YouthLeader[]>(() =>
    restQuery('youth_leaders', {
      filters: { is_visible: 'eq.true' },
      order: 'sort_order.asc',
    }),
  )

export const useLatestVideos = (limit = 3) =>
  useQuery<Media[]>(
    () =>
      restQuery('media', {
        filters: { type: 'eq.video' },
        order: 'created_at.desc',
        limit,
      }),
    [limit],
  )

/* --------------------------------------------------------------- detail */

export const useActivityBySlug = (slug?: string) =>
  useQuery<Activity>(
    () =>
      restQuery('activities', {
        filters: { slug: `eq.${slug ?? ''}`, status: inList(PUBLIC) },
        single: true,
      }),
    [slug],
  )

export const useEventBySlug = (slug?: string) =>
  useQuery<EventRow>(
    () =>
      restQuery('events', {
        filters: { slug: `eq.${slug ?? ''}`, status: inList(PUBLIC) },
        single: true,
      }),
    [slug],
  )

export const useAnnouncementBySlug = (slug?: string) =>
  useQuery<Announcement>(
    () =>
      restQuery('announcements', {
        filters: { slug: `eq.${slug ?? ''}`, status: 'eq.published' },
        single: true,
      }),
    [slug],
  )

/** All media for one activity, in the order leaders arranged it. */
export const useActivityMedia = (activityId?: string) =>
  useQuery<Media[]>(
    () =>
      activityId
        ? restQuery<Media[]>('media', {
            filters: { activity_id: `eq.${activityId}` },
            order: 'sort_order.asc,created_at.asc',
          })
        : Promise.resolve({ data: [], error: null }),
    [activityId],
  )

/**
 * Every public image, for the Gallery page.
 *
 * No join needed: the media RLS policy already hides anything whose
 * parent activity is not public.
 */
export const useAllImages = (limit = 300) =>
  useQuery<Media[]>(
    () =>
      restQuery('media', {
        filters: { type: 'eq.image' },
        order: 'created_at.desc',
        limit,
      }),
    [limit],
  )

/* --------------------------------------------------------------- helpers */

/** Group activities by the year they actually happened, newest first. */
export function groupByYear(rows: Activity[]): [number, Activity[]][] {
  const map = new Map<number, Activity[]>()
  for (const a of rows) {
    const y = new Date(a.activity_date).getFullYear()
    map.set(y, [...(map.get(y) ?? []), a])
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0])
}

export const splitMedia = (rows: Media[] | null) => ({
  photos: (rows ?? []).filter((m) => m.type === 'image'),
  videos: (rows ?? []).filter((m) => m.type === 'video'),
})
