import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
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
 * Tiny fetch hook.
 *
 * Listing queries use status = 'published' so drafts never reach the
 * public site. Detail and archive queries also allow 'archived', which
 * stays readable for historical browsing but is kept out of the
 * current/featured sections.
 *
 * RLS enforces all of this again on the server.
 *
 * Phase 8: swap for TanStack Query to get caching for free.
 */
export function useQuery<T>(
  run: () => PromiseLike<{ data: T | null; error: { message: string } | null }>,
  deps: unknown[] = [],
): Result<T> {
  const [state, setState] = useState<Result<T>>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let active = true
    setState((s) => ({ ...s, loading: true }))
    Promise.resolve(run()).then(({ data, error }) => {
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

const PUBLIC_STATUSES = ['published', 'archived']

/* ---------------------------------------------------------------- lists */

export const useSiteSettings = () =>
  useQuery<SiteSettings>(() =>
    supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
  )

export const useUpcomingEvents = (limit = 12) =>
  useQuery<EventRow[]>(
    () =>
      supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(limit),
    [limit],
  )

export const usePastEvents = (limit = 12) =>
  useQuery<EventRow[]>(
    () =>
      supabase
        .from('events')
        .select('*')
        .in('status', PUBLIC_STATUSES)
        .lt('start_date', new Date().toISOString())
        .order('start_date', { ascending: false })
        .limit(limit),
    [limit],
  )

export const useActivities = (limit = 24) =>
  useQuery<Activity[]>(
    () =>
      supabase
        .from('activities')
        .select('*')
        .eq('status', 'published')
        .order('activity_date', { ascending: false })
        .limit(limit),
    [limit],
  )

/** The long-term archive: published + archived, newest first. */
export const useArchive = (limit = 200) =>
  useQuery<Activity[]>(
    () =>
      supabase
        .from('activities')
        .select('*')
        .in('status', PUBLIC_STATUSES)
        .order('activity_date', { ascending: false })
        .limit(limit),
    [limit],
  )

export const useAnnouncements = (limit = 20) =>
  useQuery<Announcement[]>(
    () =>
      supabase
        .from('announcements')
        .select('*')
        .eq('status', 'published')
        .order('is_pinned', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(limit),
    [limit],
  )

export const useLeaders = () =>
  useQuery<YouthLeader[]>(() =>
    supabase
      .from('youth_leaders')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true }),
  )

export const useLatestVideos = (limit = 3) =>
  useQuery<Media[]>(
    () =>
      supabase
        .from('media')
        .select('*')
        .eq('type', 'video')
        .order('created_at', { ascending: false })
        .limit(limit),
    [limit],
  )

/* --------------------------------------------------------------- detail */

export const useActivityBySlug = (slug?: string) =>
  useQuery<Activity>(
    () =>
      supabase
        .from('activities')
        .select('*')
        .eq('slug', slug ?? '')
        .in('status', PUBLIC_STATUSES)
        .maybeSingle(),
    [slug],
  )

export const useEventBySlug = (slug?: string) =>
  useQuery<EventRow>(
    () =>
      supabase
        .from('events')
        .select('*')
        .eq('slug', slug ?? '')
        .in('status', PUBLIC_STATUSES)
        .maybeSingle(),
    [slug],
  )

/** All media for one activity, in the order leaders arranged it. */
export const useActivityMedia = (activityId?: string) =>
  useQuery<Media[]>(
    () =>
      supabase
        .from('media')
        .select('*')
        .eq('activity_id', activityId ?? '')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true }),
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
      supabase
        .from('media')
        .select('*')
        .eq('type', 'image')
        .order('created_at', { ascending: false })
        .limit(limit),
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
