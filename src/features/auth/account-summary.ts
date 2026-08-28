import type { Account } from '../../api/auth/types.ts'
import type { AccountSummary } from '../../lib/account.ts'

/**
 * The block at the foot of the sidebar, built from the signed-in account.
 *
 * The design's second line differs per portal — a staff number and subject, a
 * reg number and arm — but the only thing every account is known to carry is
 * what the school calls its role, so that is what it shows until each portal's
 * own record is wired up.
 */
export function accountSummary(account: Account): AccountSummary {
  const { fname, lname, username } = account.user
  const parts = [fname, lname].filter(Boolean)

  return {
    name: parts.join(' ') || username,
    line: account.role?.role_name ?? username,
    // An account with no name on it still needs two letters in the square.
    initials: (parts.length ? parts.map((part) => part[0]).join('') : username.slice(0, 2))
      .toUpperCase(),
  }
}
