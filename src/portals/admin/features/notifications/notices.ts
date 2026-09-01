import type { ActivityLog } from '../../../../api/logs/types.ts'
import { schoolMillis } from '../../../../features/collections/when.ts'
import {
  mergedFeed,
  noticeGroup,
  noticeWhen,
} from '../../../../features/notifications/notice-feed.ts'
import type { Notification } from '../../../../features/notifications/types.ts'
import { logAuthor } from '../../collections/log-row.ts'

/**
 * The office's own half of the feed, read off the audit trail.
 *
 * Everything else on an admin's screen is a state rather than an event — how
 * many invoices are unpaid, how many applicants are waiting — and a state has
 * no moment to file it under. The audit log is the one thing the API holds
 * that is already a list of things that happened, with a time and a person on
 * each. So that is the feed, and every item opens the log itself.
 *
 * **Sign-ins are left out.** They are most of the trail by volume — every API
 * call that authenticates writes one — and a bell that is four fifths "API
 * login" is a bell nobody reads. `/admin/logs` still holds them, filterable by
 * type, which is where somebody chasing a sign-in should be looking anyway.
 */

/** The one type the feed drops, and the reason it asks for more than it shows. */
const SIGN_IN = 'Login'

/**
 * How much of the trail is pulled to fill the feed.
 *
 * ponytail: over-fetched and filtered here because `/logs` takes one `type` at
 * a time and there is no "everything except" — so asking the server for the
 * three that are wanted would be three requests. Raise it if a school's trail
 * ever runs more than this many sign-ins deep between changes.
 */
export const LOG_SCAN = 50

/** How the trail's four types read on a feed the office skims. */
function kickerOf(log: ActivityLog): string {
  return log.type === 'Delete' ? 'Deletion' : 'Records'
}

function logNotice(log: ActivityLog, now: Date): Notification | null {
  if (log.type === SIGN_IN) return null
  const at = schoolMillis(log.timestamp)
  // An entry with no readable time cannot take a place in a feed ordered by it.
  if (at === null) return null

  return {
    id: `log-${log.id}`,
    kicker: kickerOf(log),
    title: log.title?.trim() || 'Something changed',
    // The trail's own sentence, word for word: it is the record of what
    // happened, and rewriting it would put the portal's words in the audit.
    body: log.description?.trim() || 'The audit trail recorded no detail.',
    meta: logAuthor(log),
    when: noticeWhen(at, now),
    group: noticeGroup(at, now),
    at,
    to: '/admin/logs',
  }
}

/** Everything the office has to be told about, newest first. */
export function adminNotices(logs: ActivityLog[], now: Date): Notification[] {
  return mergedFeed(logs.flatMap((log) => logNotice(log, now) ?? []))
}
