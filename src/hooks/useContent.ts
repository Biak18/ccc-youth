import { useEffect, useState } from 'react'
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
 */
export function useQuery<T>(run: () => Promise<T | null>, deps: unknown[] = []): Result<T> {
  const [state, setState] = useState<Result<T>>({ data: null, loading: true, error: null })

  useEffect(() => {
    let active = true
    setState((s) => ({ ...s, loading: true }))
    run().then(
      (data) => {
        if (!active) return
        setState({ data: data ?? null, loading: false, error: null })
      },
      (e) => {
        if (!active) return
        setState({ data: null, loading: false, error: (e as Error).message })
      },
    )
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
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
  useQuery<SiteSettings>(() => apiFetch<SiteSettings>('/api/settings'))

export const useUpcomingEvents = (limit = 12) =>
  useQuery<EventRow[]>(
    () => apiGetPaged<EventRow>(`/api/events?filter=upcoming&pageSize=${limit}`),
    [limit],
  )

export const usePastEvents = (limit = 12) =>
  useQuery<EventRow[]>(
    () => apiGetPaged<EventRow>(`/api/events?filter=past&pageSize=${limit}`),
    [limit],
  )

export const useActivities = (limit = 24) =>
  useQuery<Activity[]>(
    () => apiGetPaged<Activity>(`/api/activities?pageSize=${limit}`),
    [limit],
  )

/**
 * The long-term archive: published + archived, newest first. The
 * backend has no combined list for anonymous callers, so both are
 * fetched and merged client-side.
 */
export const useArchive = (limit = 200) =>
  useQuery<Activity[]>(async () => {
    const [published, archived] = await Promise.all([
      apiFetch<Paged<Activity>>(`/api/activities?pageSize=${limit}`),
      apiFetch<Paged<Activity>>(`/api/activities?status=archived&pageSize=${limit}`),
    ])
    const seen = new Set<string>()
    return [...published.items, ...archived.items]
      .filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true)))
      .sort((a, b) => b.activityDate.localeCompare(a.activityDate))
  }, [limit])

export const useAnnouncements = (limit = 20) =>
  useQuery<Announcement[]>(
    () => apiGetPaged<Announcement>(`/api/announcements?pageSize=${limit}`),
    [limit],
  )

export const useLeaders = () =>
  useQuery<YouthLeader[]>(() => apiFetch<YouthLeader[]>('/api/leaders'))

export const useLatestVideos = (limit = 3) =>
  useQuery<Media[]>(
    () => apiGetPaged<Media>(`/api/media?type=video&pageSize=${limit}`),
    [limit],
  )

/* --------------------------------------------------------------- detail */

export const useActivityBySlug = (slug?: string) =>
  useQuery<Activity>(
    () => (slug ? bySlug<Activity>(`/api/activities/slug/${slug}`) : Promise.resolve(null)),
    [slug],
  )

export const useEventBySlug = (slug?: string) =>
  useQuery<EventRow>(
    () => (slug ? bySlug<EventRow>(`/api/events/slug/${slug}`) : Promise.resolve(null)),
    [slug],
  )

export const useAnnouncementBySlug = (slug?: string) =>
  useQuery<Announcement>(
    () =>
      slug
        ? bySlug<Announcement>(`/api/announcements/slug/${slug}`)
        : Promise.resolve(null),
    [slug],
  )

/** All media for one activity, in the order leaders arranged it. */
export const useActivityMedia = (activityId?: string) =>
  useQuery<Media[]>(
    () =>
      activityId
        ? apiFetch<Media[]>(`/api/activities/${activityId}/media`)
        : Promise.resolve([]),
    [activityId],
  )

/** Every public image, for the Gallery page. */
export const useAllImages = (limit = 300) =>
  useQuery<Media[]>(
    () => apiGetPaged<Media>(`/api/media?type=image&pageSize=${limit}`),
    [limit],
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
