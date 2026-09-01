import type { Notice } from '../../api/notifications/types.ts'
import { schoolMillis } from '../collections/when.ts'
import type { Notification } from './types.ts'

/**
 * The school's notice board, read as feed items.
 *
 * Every portal's bell shows two different things at once: events worked out
 * from records the portal already holds — marks approved, papers set, fees
 * raised — and notices somebody in the office actually wrote, off
 * `GET /notifications/mine`. This maps the second kind into the shape the
 * first already uses, so one feed carries both and the bell counts once.
 *
 * A notice leads nowhere: it is the content, not a pointer at a page, so `to`
 * is left off and the row renders as text rather than a link.
 *
 * Pure on purpose — no client, no hooks — so it is testable.
 */

const MILLIS_PER_DAY = 86_400_000

/** Midnight before a moment, on the reader's own clock. */
function dayStart(millis: number): number {
  const at = new Date(millis)
  at.setHours(0, 0, 0, 0)
  return at.getTime()
}

/** Whole days between a moment and now — 0 today, 1 yesterday. */
function daysAgo(millis: number, now: Date): number {
  return Math.round((dayStart(now.getTime()) - dayStart(millis)) / MILLIS_PER_DAY)
}

/**
 * The stamp as a feed writes it: the clock time for something that happened
 * today, the word for yesterday, and the day itself for anything older — with
 * the year once it is not this one.
 */
export function noticeWhen(millis: number, now: Date): string {
  const days = daysAgo(millis, now)
  const at = new Date(millis)
  if (days <= 0) {
    return at.toLocaleTimeString('en-NG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }
  if (days === 1) return 'Yesterday'
  return at.toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    ...(at.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
  })
}

/** The two headings the page groups under. */
export function noticeGroup(millis: number, now: Date): Notification['group'] {
  return daysAgo(millis, now) <= 0 ? 'Today' : 'Earlier'
}

/**
 * Whether the board still means a notice to be read.
 *
 * A notice carries no expiry of its own — the server keeps that to itself and
 * sends `status`, which reads `active` on everything `/notifications/mine`
 * returns. So this only ever drops something on a deployment that starts
 * sending a second value, and never guesses at a date the record does not have.
 */
function live(notice: Notice): boolean {
  const status = notice.status?.trim().toLowerCase()
  return !status || status === 'active'
}

/**
 * Who posted it and how far it reached — "Chukwudi Aniegboka · Whole school",
 * or the class where the notice is limited to one.
 *
 * A notice is the only thing on the feed with an author: everything else is a
 * record read as an event, and no record has a person behind it.
 */
export function noticeMeta(notice: Notice): string | undefined {
  const who = notice.is_automatic
    ? 'Posted automatically'
    : notice.posted_by?.trim() || null
  const where =
    notice.scope === 'class' ? notice.class_name?.trim() || 'One class' : 'Whole school'
  return [who, where].filter(Boolean).join(' \u00b7 ') || undefined
}

/**
 * One notice as a feed item, or nothing where it has no readable date — a
 * feed is ordered by time and an item with no time cannot take a place in it.
 */
function feedItem(notice: Notice, now: Date): Notification | null {
  const at = schoolMillis(notice.datecreated)
  if (at === null) return null

  return {
    // Prefixed, because the derived items are keyed on their own records and
    // a bare id would collide with a paper's.
    id: `notice-${notice.id}`,
    noticeId: notice.id,
    // Its own tag, so the board is told apart from the events around it.
    kicker: 'Notice',
    title: notice.title?.trim() || 'Untitled notice',
    body: notice.message?.trim() || 'The office posted this with no message.',
    meta: noticeMeta(notice),
    when: noticeWhen(at, now),
    group: noticeGroup(at, now),
    at,
    read: notice.is_read === true,
  }
}

/** The board, newest first, with anything withdrawn or undated left out. */
export function noticeFeed(notices: Notice[], now: Date): Notification[] {
  return notices
    .filter(live)
    .flatMap((notice) => feedItem(notice, now) ?? [])
    .sort((one, two) => (two.at ?? 0) - (one.at ?? 0))
}

/** Two feeds worked out separately, in one order. Newest first. */
export function mergedFeed(...feeds: Notification[][]): Notification[] {
  return feeds.flat().sort((one, two) => (two.at ?? 0) - (one.at ?? 0))
}
