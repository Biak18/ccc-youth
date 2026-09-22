import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Activity, Announcement, EventRow, Media, YouthLeader } from '../types/db'

/**
 * Admin queries deliberately include drafts. RLS lets signed-in staff
 * read every status, while the public policies still hide drafts.
 */
export function useAdminQuery<T>(
  run: () => PromiseLike<{ data: T | null; error: { message: string } | null }>,
  deps: unknown[] = [],
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.resolve(run()).then(({ data, error }) => {
      if (!active) return
      setData(data ?? null)
      setError(error?.message ?? null)
      setLoading(false)
    })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  return { data, loading, error, reload }
}

export const useAllActivities = () =>
  useAdminQuery<Activity[]>(() =>
    supabase.from('activities').select('*').order('activity_date', { ascending: false }),
  )

export const useAllEvents = () =>
  useAdminQuery<EventRow[]>(() =>
    supabase.from('events').select('*').order('start_date', { ascending: false }),
  )

export const useAllAnnouncements = () =>
  useAdminQuery<Announcement[]>(() =>
    supabase
      .from('announcements')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false }),
  )

export const useAllLeaders = () =>
  useAdminQuery<YouthLeader[]>(() =>
    supabase.from('youth_leaders').select('*').order('sort_order', { ascending: true }),
  )

export const useActivityById = (id?: string) =>
  useAdminQuery<Activity>(
    () => supabase.from('activities').select('*').eq('id', id ?? '').maybeSingle(),
    [id],
  )

export const useEventById = (id?: string) =>
  useAdminQuery<EventRow>(
    () => supabase.from('events').select('*').eq('id', id ?? '').maybeSingle(),
    [id],
  )

export const useAnnouncementById = (id?: string) =>
  useAdminQuery<Announcement>(
    () => supabase.from('announcements').select('*').eq('id', id ?? '').maybeSingle(),
    [id],
  )

export const useMediaByActivity = (activityId?: string) =>
  useAdminQuery<Media[]>(
    () =>
      supabase
        .from('media')
        .select('*')
        .eq('activity_id', activityId ?? '')
        .order('sort_order', { ascending: true }),
    [activityId],
  )

export type DashboardStats = {
  activities: number
  upcomingEvents: number
  drafts: number
  photos: number
  videos: number
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    const head = { count: 'exact' as const, head: true }
    Promise.all([
      supabase.from('activities').select('id', head).eq('status', 'published'),
      supabase
        .from('events')
        .select('id', head)
        .eq('status', 'published')
        .gte('start_date', new Date().toISOString()),
      supabase.from('activities').select('id', head).eq('status', 'draft'),
      supabase.from('media').select('id', head).eq('type', 'image'),
      supabase.from('media').select('id', head).eq('type', 'video'),
    ]).then(([a, e, d, p, v]) => {
      setStats({
        activities: a.count ?? 0,
        upcomingEvents: e.count ?? 0,
        drafts: d.count ?? 0,
        photos: p.count ?? 0,
        videos: v.count ?? 0,
      })
    })
  }, [])

  return stats
}
