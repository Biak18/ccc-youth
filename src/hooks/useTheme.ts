import { createContext, useContext } from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_KEY = 'ccc-theme'

export function systemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function resolveTheme(t: Theme): ResolvedTheme {
  return t === 'system' ? systemTheme() : t
}

export function applyTheme(resolved: ResolvedTheme) {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

export type ThemeValue = {
  theme: Theme
  resolved: ResolvedTheme
  cycle: () => void
}

export const ThemeContext = createContext<ThemeValue>({
  theme: 'system',
  resolved: 'light',
  cycle: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}
