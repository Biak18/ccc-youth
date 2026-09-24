import { useCallback, type Dispatch, type SetStateAction } from 'react'
import {
  useQuery as useTanStackQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query'
import { apiFetch, authedGet, type Paged } from '../lib/api'
import type { Activity, Announcement, EventRow, Media, YouthLeader } from '../types/db'

/**
 * Admin reads go to the backend with the access-token header.
 * Signed-in staff see published + archived + own drafts; admins see
 * everything including drafts.
 *
 * Backed by TanStack Query: switching admin routes within the
 * `staleTime` window serves instant cached data instead of refetching
 * on every mount. `reload` invalidates the key (silent background
 * refresh — current rows stay on screen), and `setData` allows
 * optimistic updates (e.g. drop a deleted row instantly).
 */
export function useAdminQuery<T>(key: QueryKey, run: () => Promise<T | null>) {
  const queryClient = useQueryClient()
  const query = useTanStackQuery({ queryKey: key, queryFn: run })

  const reload = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: key })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, JSON.stringify(key)])

  const setData: Dispatch<SetStateAction<T | null>> = useCallback(
    (action) => {
      queryClient.setQueryData<T | null>(key, (old) =>
        typeof action === 'function'
          ? (action as (prev: T | null) => T | null)(old ?? null)
          : action,
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryClient, JSON.stringify(key)],
  )

  return {
    data: query.data ?? null,
    // Pending only when there is no data yet: the skeleton shows on
    // first load, never when switching back to a cached route.
    loading: query.isPending,
    error: query.error ? (query.error as Error).message : null,
    reload,
    setData,
  }
}

/** A missing row is an empty result, not an error. */
async function byId<T>(path: string): Promise<T | null> {
  try {
    return await authedGet<T>(path)
  } catch (e) {
    if ((e as { status?: number }).status === 404) return null
    throw e
  }
}

export const useAllActivities = () =>
  useAdminQuery<Activity[]>(['admin', 'activities'], () =>
    apiFetch<Paged<Activity>>('/api/activities?pageSize=100', { auth: true }).then(
      (p) => p.items,
    ),
  )

export const useAllEvents = () =>
  useAdminQuery<EventRow[]>(['admin', 'events'], () =>
    apiFetch<Paged<EventRow>>('/api/events?filter=all&pageSize=100', { auth: true }).then(
      (p) => p.items,
    ),
  )

export const useAllAnnouncements = () =>
  useAdminQuery<Announcement[]>(['admin', 'announcements'], () =>
    apiFetch<Paged<Announcement>>('/api/announcements?pageSize=100', {
      auth: true,
    }).then((p) => p.items),
  )

export const useAllLeaders = () =>
  useAdminQuery<YouthLeader[]>(['admin', 'leaders'], () =>
    authedGet<YouthLeader[]>('/api/leaders/all'),
  )

export const useActivityById = (id?: string) =>
  useAdminQuery<Activity>(['admin', 'activity', id ?? null], () =>
    id ? byId<Activity>(`/api/activities/${id}`) : Promise.resolve(null),
  )

export const useEventById = (id?: string) =>
  useAdminQuery<EventRow>(['admin', 'event', id ?? null], () =>
    id ? byId<EventRow>(`/api/events/${id}`) : Promise.resolve(null),
  )

export const useAnnouncementById = (id?: string) =>
  useAdminQuery<Announcement>(['admin', 'announcement', id ?? null], () =>
    id ? byId<Announcement>(`/api/announcements/${id}`) : Promise.resolve(null),
  )

export const useMediaByActivity = (activityId?: string) =>
  useAdminQuery<Media[]>(['admin', 'media', activityId ?? null], () =>
    activityId
      ? authedGet<Media[]>(`/api/activities/${activityId}/media`)
      : Promise.resolve([]),
  )

export type DashboardStats = {
  activities: number
  upcomingEvents: number
  drafts: number
  photos: number
  videos: number
}

/**
 * No stats endpoint exists, so counts come from `totalCount`
 * with `pageSize=1`.
 */
export function useDashboardStats() {
  const query = useTanStackQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: async (): Promise<DashboardStats | null> => {
      const total = (path: string) =>
        apiFetch<Paged<unknown>>(path, { auth: true }).then((p) => p.totalCount)
      try {
        const [activities, upcomingEvents, drafts, photos, videos] = await Promise.all([
          total('/api/activities?status=published&pageSize=1'),
          total('/api/events?filter=upcoming&pageSize=1'),
          total('/api/activities?status=draft&pageSize=1'),
          total('/api/media?type=image&pageSize=1'),
          total('/api/media?type=video&pageSize=1'),
        ])
        return { activities, upcomingEvents, drafts, photos, videos }
      } catch {
        return null
      }
    },
  })
  return query.data ?? null
}
