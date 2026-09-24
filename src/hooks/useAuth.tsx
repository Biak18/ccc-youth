import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { apiFetch, authLogin, authLogout, authMe, tokenStore, type MeUser } from '../lib/api'

type AuthValue = {
  user: MeUser | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Page refresh: one refresh call, then load the profile.
  useEffect(() => {
    let active = true
    const init = async () => {
      if (!tokenStore.getRefresh()) {
        setLoading(false)
        return
      }
      try {
        const pair = await apiFetch<{ accessToken: string; refreshToken: string }>(
          '/api/auth/refresh',
          {
            method: 'POST',
            body: JSON.stringify({ refreshToken: tokenStore.getRefresh() }),
            retry: false,
          },
        )
        tokenStore.set(pair.accessToken, pair.refreshToken)
        const me = await authMe()
        if (active) setUser(me)
      } catch {
        tokenStore.clear()
      } finally {
        if (active) setLoading(false)
      }
    }
    init()
    return () => {
      active = false
    }
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'admin',
      signIn: async (email, password) => {
        try {
          const pair = await authLogin(email, password)
          tokenStore.set(pair.accessToken, pair.refreshToken)
          const me = await authMe()
          setUser(me)
          return { error: null }
        } catch (e) {
          return { error: (e as Error).message ?? 'Could not sign in.' }
        }
      },
      signOut: async () => {
        await authLogout()
        tokenStore.clear()
        setUser(null)
      },
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
