// Relative and extensioned, like the rest of what the node test runner reads.
import type { Account } from '../../api/auth/types.ts'

export type Role = 'Admin' | 'Teacher' | 'Student' | 'Parent'

export type Portal = {
  role: Role
  label: string
  hint: string
  to: string
}

export const PORTALS: Portal[] = [
  { role: 'Admin', label: 'Admin portal', hint: 'Office and bursary', to: '/admin' },
  { role: 'Teacher', label: 'Teacher portal', hint: 'Scores and registers', to: '/teacher' },
  { role: 'Student', label: 'Student portal', hint: 'Results and materials', to: '/student' },
  { role: 'Parent', label: 'Parent portal', hint: 'Fees and progress', to: '/parent' },
]

/** `profile_type` as the API spells it, against the portal it opens. */
const PROFILE_ROLES: Record<string, Role> = {
  admin: 'Admin',
  teacher: 'Teacher',
  student: 'Student',
  // The API calls a guardian record an sparent; a school calls it a parent.
  sparent: 'Parent',
  parent: 'Parent',
}

/** The wording fallback, matched loosely — "Super Admin" is an admin. */
const NAMED_ROLES: [string, Role][] = [
  ['admin', 'Admin'],
  ['teacher', 'Teacher'],
  ['student', 'Student'],
  ['parent', 'Parent'],
]

/**
 * The account decides the portal, not the person signing in.
 *
 * `profile_type` is the answer whenever the API gives one: it names which kind
 * of record the login owns, from a fixed set. `role_name` is only consulted
 * behind it, because a school can rename its roles and the API is happy to
 * call an administrator a "Super Admin".
 *
 * `null` means no portal — the account exists but belongs to none of the four.
 */
export function roleForAccount(account: Account): Role | null {
  const profileType = account.profile_type?.toLowerCase()
  if (profileType && PROFILE_ROLES[profileType]) return PROFILE_ROLES[profileType]

  const name = account.role?.role_name?.toLowerCase() ?? ''
  return NAMED_ROLES.find(([spelling]) => name.includes(spelling))?.[1] ?? null
}

export function portalFor(role: Role): Portal {
  return PORTALS.find((portal) => portal.role === role) ?? PORTALS[1]
}

/**
 * The school's own super-administrator role. Its id is fixed on the server —
 * bronze lists Admin 1, Super Admin 5, Bursar 7 — but a school may rename it,
 * so the name is read first and the id answers when the name has been changed
 * to something else.
 */
const SUPER_ADMIN_ROLE_ID = 5

/**
 * Whether this account may act on other administrators: granting and taking
 * away privileges, and deleting an office record. The API enforces it either
 * way; this is so the portal stops offering what it knows will be refused.
 */
export function isSuperAdmin(account: Account | null | undefined): boolean {
  const role = account?.role
  return role ? isSuperAdminRole(role.role_name, role.id) : false
}

/**
 * The same question of a role read off a record rather than off the session —
 * the register carries the account's role by name, and that is all a row has
 * to say who it belongs to.
 */
export function isSuperAdminRole(
  name: string | null | undefined,
  id?: number | null,
): boolean {
  return /super\s*admin/i.test(name ?? '') || id === SUPER_ADMIN_ROLE_ID
}
