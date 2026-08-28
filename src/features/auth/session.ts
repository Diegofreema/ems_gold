import { useCurrentUser } from '@/api/auth/hooks'
import type { User } from '@/api/users/types'
import { type Portal, portalFor, type Role, roleForAccount } from './role'

/** The signed-in account as the screens need it. Everything is null while out. */
export type Session = {
  user: User | null
  role: Role | null
  portal: Portal | null
  isPending: boolean
}

/**
 * One read of the signed-in account. The query is cached under a single key,
 * so every screen that calls this shares the same request.
 */
export function useSession(): Session {
  const { data, isPending } = useCurrentUser()
  const role = data ? roleForAccount(data) : null

  return {
    user: data?.user ?? null,
    role,
    portal: role ? portalFor(role) : null,
    isPending,
  }
}

/** "Chukwuma Nnaji" — the API keeps the parts apart. */
export function fullName(user: User): string {
  return [user.fname, user.lname].filter(Boolean).join(' ')
}
