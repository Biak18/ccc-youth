import { useQuery as useTanStackQuery, type QueryKey } from '@tanstack/react-query'
import { ApiError, apiFetch, apiGetPaged, type Paged } from '../lib/api'
import type {
  Activity,
  Announcement,
  EventRow,
  Media,
  SiteSettings,
  YouthLeader,
} from '../types/db'

type Result<T> = { data: T | null; loading: boolean; error: string | null }

/**
 * Public reads go to the backend with no auth header; anonymous
 * callers only ever see published content.
 *
 * Backed by TanStack Query: navbar/route switches within the
 * `staleTime` window render instant cached data instead of refetching
 * on every mount. Same `{ data, loading, error }` shape as before.
 */
export function useQuery<T>(key: QueryKey, run: () => Promise<T | null>): Result<T> {
  const query = useTanStackQuery({ queryKey: key, queryFn: run })
  return {
    data: query.data ?? null,
    // Pending only when there is no data yet: skeletons show on first
    // load, never when switching back to a cached page.
    loading: query.isPending,
    error: query.error ? (query.error as Error).message : null,
  }
}

/** A 404 on a slug lookup is an empty result, not an error. */
async function bySlug<T>(path: string): Promise<T | null> {
  try {
    return await apiFetch<T>(path)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  }
}

/* ---------------------------------------------------------------- lists */

export const useSiteSettings = () =>
  useQuery<SiteSettings>(['site-settings'], () => apiFetch<SiteSettings>('/api/settings'))

export const useUpcomingEvents = (limit = 12) =>
  useQuery<EventRow[]>(
    ['events', 'upcoming', limit],
    () => apiGetPaged<EventRow>(`/api/events?filter=upcoming&pageSize=${limit}`),
  )

export const usePastEvents = (limit = 12) =>
  useQuery<EventRow[]>(
    ['events', 'past', limit],
    () => apiGetPaged<EventRow>(`/api/events?filter=past&pageSize=${limit}`),
  )

export const useActivities = (limit = 24) =>
  useQuery<Activity[]>(
    ['activities', limit],
    () => apiGetPaged<Activity>(`/api/activities?pageSize=${limit}`),
  )

/**
 * The long-term archive: published + archived, newest first. The
 * backend has no combined list for anonymous callers, so both are
 * fetched and merged client-side.
 */
export const useArchive = (limit = 200) =>
  useQuery<Activity[]>(['activities', 'archive', limit], async () => {
    const [published, archived] = await Promise.all([
      apiFetch<Paged<Activity>>(`/api/activities?pageSize=${limit}`),
      apiFetch<Paged<Activity>>(`/api/activities?status=archived&pageSize=${limit}`),
    ])
    const seen = new Set<string>()
    return [...published.items, ...archived.items]
      .filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true)))
      .sort((a, b) => b.activityDate.localeCompare(a.activityDate))
  })

export const useAnnouncements = (limit = 20) =>
  useQuery<Announcement[]>(
    ['announcements', limit],
    () => apiGetPaged<Announcement>(`/api/announcements?pageSize=${limit}`),
  )

export const useLeaders = () =>
  useQuery<YouthLeader[]>(['leaders'], () => apiFetch<YouthLeader[]>('/api/leaders'))

export const useLatestVideos = (limit = 3) =>
  useQuery<Media[]>(
    ['media', 'videos', limit],
    () => apiGetPaged<Media>(`/api/media?type=video&pageSize=${limit}`),
  )

/* --------------------------------------------------------------- detail */

export const useActivityBySlug = (slug?: string) =>
  useQuery<Activity>(['activity', slug ?? null], () =>
    slug ? bySlug<Activity>(`/api/activities/slug/${slug}`) : Promise.resolve(null),
  )

export const useEventBySlug = (slug?: string) =>
  useQuery<EventRow>(['event', slug ?? null], () =>
    slug ? bySlug<EventRow>(`/api/events/slug/${slug}`) : Promise.resolve(null),
  )

export const useAnnouncementBySlug = (slug?: string) =>
  useQuery<Announcement>(['announcement', slug ?? null], () =>
    slug
      ? bySlug<Announcement>(`/api/announcements/slug/${slug}`)
      : Promise.resolve(null),
  )

/** All media for one activity, in the order leaders arranged it. */
export const useActivityMedia = (activityId?: string) =>
  useQuery<Media[]>(['activity-media', activityId ?? null], () =>
    activityId
      ? apiFetch<Media[]>(`/api/activities/${activityId}/media`)
      : Promise.resolve([]),
  )

/** Every public image, for the Gallery page. */
export const useAllImages = (limit = 300) =>
  useQuery<Media[]>(
    ['media', 'images', limit],
    () => apiGetPaged<Media>(`/api/media?type=image&pageSize=${limit}`),
  )

/* --------------------------------------------------------------- helpers */

/** Group activities by the year they actually happened, newest first. */
export function groupByYear(rows: Activity[]): [number, Activity[]][] {
  const map = new Map<number, Activity[]>()
  for (const a of rows) {
    const y = new Date(a.activityDate).getFullYear()
    map.set(y, [...(map.get(y) ?? []), a])
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0])
}

export const splitMedia = (rows: Media[] | null) => ({
  photos: (rows ?? []).filter((m) => m.type === 'image'),
  videos: (rows ?? []).filter((m) => m.type === 'video'),
})
