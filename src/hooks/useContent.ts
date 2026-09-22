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

type State<T> = { data: T; loading: boolean; error: string | null }

/**
 * Tiny fetch hook. Every query filters status = 'published' so draft
 * content can never reach the public site (RLS enforces this again
 * on the server).
 *
 * Phase 8: swap these for TanStack Query to get caching for free.
 */
function useQuery<T>(run: () => PromiseLike<{ data: T | null; error: { message: string } | null }>, deps: unknown[] = []) {
  const [state, setState] = useState<State<T | null>>({
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

export const useSiteSettings = () =>
  useQuery<SiteSettings>(() =>
    supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
  )

export const useUpcomingEvents = (limit = 12) =>
  useQuery<EventRow[]>(() =>
    supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(limit),
  )

export const usePastEvents = (limit = 12) =>
  useQuery<EventRow[]>(() =>
    supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .lt('start_date', new Date().toISOString())
      .order('start_date', { ascending: false })
      .limit(limit),
  )

export const useActivities = (limit = 24) =>
  useQuery<Activity[]>(() =>
    supabase
      .from('activities')
      .select('*')
      .eq('status', 'published')
      .order('activity_date', { ascending: false })
      .limit(limit),
  )

export const useAnnouncements = (limit = 20) =>
  useQuery<Announcement[]>(() =>
    supabase
      .from('announcements')
      .select('*')
      .eq('status', 'published')
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(limit),
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
  useQuery<Media[]>(() =>
    supabase
      .from('media')
      .select('*')
      .eq('type', 'video')
      .order('created_at', { ascending: false })
      .limit(limit),
  )

/** Group activities by the year they actually happened. */
export function groupByYear(rows: Activity[]) {
  const map = new Map<number, Activity[]>()
  for (const a of rows) {
    const y = new Date(a.activity_date).getFullYear()
    map.set(y, [...(map.get(y) ?? []), a])
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0])
}
