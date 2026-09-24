/**
 * Backend API client for the CityYouth (.NET) API.
 *
 * Conventions (FRONTEND_BINDING.md section 1):
 * - base: `VITE_API_URL + "/api/..."` (no trailing slash in env)
 * - camelCase JSON everywhere
 * - lists: paged `{ items, page, pageSize, totalCount }` envelope,
 *   except leaders / activity-media (bare arrays) and settings (object)
 * - errors: ASP.NET ProblemDetails `{ title, detail, status }`
 * - admin calls carry `Authorization: Bearer <accessToken>`
 */

const raw = import.meta.env.VITE_API_URL as string | undefined

if (!raw) {
  throw new Error('Missing VITE_API_URL in .env.local')
}

export const API_BASE = raw.replace(/\/$/, '')

export type Problem = { title: string; detail?: string; status: number }

export class ApiError extends Error {
  status: number
  title: string
  constructor(status: number, title: string, detail?: string) {
    super(detail || title || `Request failed (${status})`)
    this.name = 'ApiError'
    this.status = status
    this.title = title
  }
}

/* ---------------------------------------------------------- tokens */

const ACCESS_KEY = 'ccc-youth.accessToken'
const REFRESH_KEY = 'ccc-youth.refreshToken'

export const tokenStore = {
  getAccess(): string | null {
    return localStorage.getItem(ACCESS_KEY)
  },
  getRefresh(): string | null {
    return localStorage.getItem(REFRESH_KEY)
  },
  set(accessToken: string, refreshToken: string) {
    localStorage.setItem(ACCESS_KEY, accessToken)
    localStorage.setItem(REFRESH_KEY, refreshToken)
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

/* ---------------------------------------------------------- fetch */

type FetchOpts = {
  /** Attach the access token. On 401, try one refresh + retry once. */
  auth?: boolean
  /** Internal: refresh call itself must not trigger another refresh. */
  retry?: boolean
} & RequestInit

async function readProblem(res: Response): Promise<{ title: string; detail?: string }> {
  const body = (await res.json().catch(() => null)) as {
    title?: string
    detail?: string
    message?: string
    // ASP.NET ValidationProblemDetails: per-field messages live here.
    errors?: Record<string, string[]>
  } | null
  if (body?.errors && typeof body.errors === 'object') {
    const detail = Object.entries(body.errors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('; ')
    return { title: body.title ?? `Request failed (${res.status})`, detail }
  }
  return {
    title: body?.title ?? body?.message ?? `Request failed (${res.status})`,
    detail: body?.detail,
  }
}

// Single-flight refresh so parallel 401s cause exactly one refresh call
// (auth endpoints are rate-limited to 5/min/IP).
let refreshPromise: Promise<boolean> | null = null

function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const refreshToken = tokenStore.getRefresh()
        if (!refreshToken) return false
        const res = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
        if (!res.ok) return false
        const pair = (await res.json()) as {
          accessToken: string
          refreshToken: string
        }
        tokenStore.set(pair.accessToken, pair.refreshToken)
        return true
      } catch {
        return false
      } finally {
        refreshPromise = null
      }
    })()
  }
  return refreshPromise
}

export async function apiFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { auth = false, retry = true, headers, ...init } = opts

  const run = async (): Promise<Response> =>
    fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(headers ?? {}),
        ...(auth && tokenStore.getAccess()
          ? { Authorization: `Bearer ${tokenStore.getAccess()}` }
          : {}),
      },
    })

  let res = await run()

  if (res.status === 401 && auth && retry) {
    const ok = await tryRefresh()
    if (ok) {
      res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: {
          ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
          ...(headers ?? {}),
          Authorization: `Bearer ${tokenStore.getAccess()}`,
        },
      })
    }
  }

  if (!res.ok) {
    const problem = await readProblem(res)
    throw new ApiError(res.status, problem.title, problem.detail)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

/* ---------------------------------------------------------- helpers */

export type Paged<T> = {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
}

/** Unwrap a paged envelope into its items. */
export const apiGetPaged = async <T>(path: string): Promise<T[]> =>
  (await apiFetch<Paged<T>>(path)).items

/** Paged envelope plus the total (for dashboard stats). */
export const apiGetTotal = async (path: string): Promise<number> =>
  (await apiFetch<Paged<unknown>>(path)).totalCount

export const authedGet = <T>(path: string) => apiFetch<T>(path, { auth: true })

export const authedPost = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body), auth: true })

export const authedPut = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body), auth: true })

export const authedPatch = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body), auth: true })

export const authedDelete = (path: string) =>
  apiFetch<void>(path, { method: 'DELETE', auth: true })

/* ---------------------------------------------------------- auth */

export type AuthPair = {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export type MeUser = {
  id: string
  email: string
  displayName: string | null
  role: 'admin' | 'leader'
}

export const authLogin = (email: string, password: string) =>
  apiFetch<AuthPair>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    retry: false,
  })

export const authMe = () => apiFetch<MeUser>('/api/auth/me', { auth: true })

export const authLogout = async () => {
  const token = tokenStore.getAccess()
  try {
    if (token) {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
    }
  } catch {
    /* best-effort */
  }
}
