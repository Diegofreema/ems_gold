import type { QueryClient } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'
import { meQueryOptions } from '@/api/auth/hooks'
import { ApiError } from '@/api/client'
import { getToken, setToken } from '@/api/token'
import { useAuthStore } from './auth.store'
import { type Role, roleForAccount } from './role'

/**
 * Guards a portal's shell. Resolving the account here rather than inside the
 * shell means a wrong account never sees a frame of a portal it cannot use.
 */
export async function requirePortal(queryClient: QueryClient, role: Role) {
  if (getToken() === null) throw redirect({ to: '/sign-in' })

  const me = await queryClient.ensureQueryData(meQueryOptions()).catch((error: unknown) => {
    // Only a refused token ends the session. A network failure or a 500 does
    // not, and must not throw away a token that is still good — nobody should
    // be told they were signed out when they were not.
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) return null
    throw error
  })

  if (!me) {
    setToken(null)
    queryClient.clear()
    throw redirect({ to: '/session-expired' })
  }

  if (roleForAccount(me) !== role) throw redirect({ to: '/wrong-portal' })
}

/**
 * Keeps the three reset screens in order. Neither of the last two can do
 * anything without the id step 1 returned, and the last also needs the ticket
 * step 2 traded the code for.
 */
export function requireRecovery(step: 'code' | 'password') {
  const { userId, ticket } = useAuthStore.getState()
  if (userId === null) throw redirect({ to: '/forgot-password' })
  if (step === 'password' && ticket === null) throw redirect({ to: '/check-email' })
}
