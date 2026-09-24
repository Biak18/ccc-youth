import { useCallback, useEffect, useState } from 'react'
import { apiFetch, authedGet, type Paged } from '../lib/api'
import type { Activity, Announcement, EventRow, Media, YouthLeader } from '../types/db'

/**
 * Admin reads go to the backend with the access-token header.
 * Signed-in staff see published + archived + own drafts; admins see
 * everything including drafts.
 */
export function useAdminQuery<T>(run: () => Promise<T | null>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let active = true
    setLoading(true)
    run().then(
      (rows) => {
        if (!active) return
        setData(rows)
        setError(null)
        setLoading(false)
      },
      (e) => {
        if (!active) return
        setData(null)
        setError((e as Error).message)
        setLoading(false)
      },
    )
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  return { data, loading, error, reload }
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
  useAdminQuery<Activity[]>(() =>
    apiFetch<Paged<Activity>>('/api/activities?pageSize=100', { auth: true }).then(
      (p) => p.items,
    ),
  )

export const useAllEvents = () =>
  useAdminQuery<EventRow[]>(() =>
    apiFetch<Paged<EventRow>>('/api/events?filter=all&pageSize=100', { auth: true }).then(
      (p) => p.items,
    ),
  )

export const useAllAnnouncements = () =>
  useAdminQuery<Announcement[]>(() =>
    apiFetch<Paged<Announcement>>('/api/announcements?pageSize=100', {
      auth: true,
    }).then((p) => p.items),
  )

export const useAllLeaders = () =>
  useAdminQuery<YouthLeader[]>(() => authedGet<YouthLeader[]>('/api/leaders/all'))

export const useActivityById = (id?: string) =>
  useAdminQuery<Activity>(
    () => (id ? byId<Activity>(`/api/activities/${id}`) : Promise.resolve(null)),
    [id],
  )

export const useEventById = (id?: string) =>
  useAdminQuery<EventRow>(
    () => (id ? byId<EventRow>(`/api/events/${id}`) : Promise.resolve(null)),
    [id],
  )

export const useAnnouncementById = (id?: string) =>
  useAdminQuery<Announcement>(
    () => (id ? byId<Announcement>(`/api/announcements/${id}`) : Promise.resolve(null)),
    [id],
  )

export const useMediaByActivity = (activityId?: string) =>
  useAdminQuery<Media[]>(
    () =>
      activityId
        ? authedGet<Media[]>(`/api/activities/${activityId}/media`)
        : Promise.resolve([]),
    [activityId],
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
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    let active = true
    const total = (path: string) =>
      apiFetch<Paged<unknown>>(path, { auth: true }).then((p) => p.totalCount)
    Promise.all([
      total('/api/activities?status=published&pageSize=1'),
      total('/api/events?filter=upcoming&pageSize=1'),
      total('/api/activities?status=draft&pageSize=1'),
      total('/api/media?type=image&pageSize=1'),
      total('/api/media?type=video&pageSize=1'),
    ]).then(
      ([activities, upcomingEvents, drafts, photos, videos]) => {
        if (active) setStats({ activities, upcomingEvents, drafts, photos, videos })
      },
      () => {
        if (active) setStats(null)
      },
    )
    return () => {
      active = false
    }
  }, [])

  return stats
}
