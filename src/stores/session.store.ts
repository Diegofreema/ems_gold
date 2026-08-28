import type { QueryClient } from '@tanstack/react-query'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Account } from '@/api/auth/types'
import { setToken } from '@/api/token'

type SessionState = {
  /** Exactly what `/users/me` last answered, or null while signed out. */
  account: Account | null
  setAccount: (account: Account) => void
  clear: () => void
}

/**
 * The signed-in account, kept in the browser so a reload has an identity
 * before `/users/me` has answered again.
 *
 * It is a copy, never an authority: the API decides what an account may do,
 * and the portal guard refetches on every entry and clears this the moment a
 * token is refused. Editing it by hand buys a shell with no data in it.
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      account: null,
      setAccount: (account) => set({ account }),
      clear: () => set({ account: null }),
    }),
    { name: 'netpro.session' },
  ),
)

/**
 * Ends the session on this device — token, cached queries and stored account
 * together, so no half-signed-out state can be left behind.
 */
export function endSession(queryClient: QueryClient) {
  setToken(null)
  queryClient.clear()
  useSessionStore.getState().clear()
}
