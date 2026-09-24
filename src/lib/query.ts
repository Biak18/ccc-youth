import { QueryClient } from '@tanstack/react-query'

/**
 * Shared cache for public reads and the dashboard. Data stays fresh
 * for 60s, so navbar/route switches within that window render
 * instantly with zero requests instead of refetching on every mount.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
