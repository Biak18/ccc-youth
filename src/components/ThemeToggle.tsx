import { useTheme } from '../hooks/useTheme'

/**
 * Cycles system -> light -> dark. 44px touch target per
 * ui-ux-pro-max touch guidance; icon shows the active mode.
 */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, cycle } = useTheme()

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Color theme: ${theme}. Activate to change.`}
      title={`Theme: ${theme}`}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors ${className}`}
    >
      {theme === 'dark' ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      ) : theme === 'light' ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.4M12 19.1v2.4M4.3 4.3l1.7 1.7M18 18l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.3 19.7L6 18M18 6l1.7-1.7" />
        </svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <rect x="3" y="4.5" width="18" height="12" rx="2" />
          <path d="M9 20.5h6M12 16.5v4" />
        </svg>
      )}
    </button>
  )
}
