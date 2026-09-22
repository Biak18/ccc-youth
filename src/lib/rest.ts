/**
 * Tiny read-only PostgREST client for the public site.
 *
 * The supabase-js SDK is ~110 kB gzipped and is only needed for auth,
 * storage uploads and writes - all of which live in the dashboard. Public
 * pages just read published rows, so they use plain fetch instead and the
 * SDK stays out of the visitor's bundle entirely.
 *
 * The same RLS policies apply: this uses the public anon key and the
 * server decides what it is allowed to return.
 */
const URL_BASE = import.meta.env.VITE_SUPABASE_URL
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!URL_BASE || !ANON_KEY) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local')
}

export type RestResult<T> = { data: T | null; error: { message: string } | null }

type Options = {
  select?: string
  /** Column filters, e.g. { status: 'eq.published' } */
  filters?: Record<string, string>
  order?: string
  limit?: number
  single?: boolean
}

export async function restQuery<T>(table: string, options: Options = {}): Promise<RestResult<T>> {
  const params = new URLSearchParams()
  params.set('select', options.select ?? '*')
  for (const [column, condition] of Object.entries(options.filters ?? {})) {
    params.append(column, condition)
  }
  if (options.order) params.set('order', options.order)
  if (options.limit) params.set('limit', String(options.limit))

  try {
    const res = await fetch(`${URL_BASE}/rest/v1/${table}?${params}`, {
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        Accept: options.single ? 'application/vnd.pgrst.object+json' : 'application/json',
      },
    })

    if (!res.ok) {
      // A "single" query with no match is an empty result, not an error.
      if (options.single && res.status === 406) return { data: null, error: null }
      const body = (await res.json().catch(() => null)) as { message?: string } | null
      return { data: null, error: { message: body?.message ?? `Request failed (${res.status})` } }
    }

    return { data: (await res.json()) as T, error: null }
  } catch (e) {
    return { data: null, error: { message: (e as Error).message } }
  }
}

/** Builds an `in.(a,b)` filter value. */
export const inList = (values: string[]) => `in.(${values.join(',')})`
