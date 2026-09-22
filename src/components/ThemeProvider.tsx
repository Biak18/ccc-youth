import { useCallback, useEffect, useState, type ReactNode } from 'react'
import {
  ThemeContext,
  applyTheme,
  resolveTheme,
  systemTheme,
  THEME_KEY,
  type Theme,
} from '../hooks/useTheme'

const order: Theme[] = ['system', 'light', 'dark']

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY)
      return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system'
    } catch {
      return 'system'
    }
  })

  useEffect(() => {
    applyTheme(resolveTheme(theme))
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // Private browsing: theme just won't persist.
    }
  }, [theme])

  // Follow the OS while in system mode.
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme(systemTheme())
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])

  const cycle = useCallback(() => {
    setTheme((t) => order[(order.indexOf(t) + 1) % order.length])
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, resolved: resolveTheme(theme), cycle }}>
      {children}
    </ThemeContext.Provider>
  )
}
