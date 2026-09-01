import type {
  ChildAssignment,
  ChildAssignmentPaper,
  FamilyInvoice,
} from '../../../../api/parents/types.ts'
import { SETTLED } from '../../../../features/collections/invoice.ts'
import { schoolMillis, schoolTime, when } from '../../../../features/collections/when.ts'
import {
  mergedFeed,
  noticeGroup,
  noticeWhen,
} from '../../../../features/notifications/notice-feed.ts'
import type { Notification } from '../../../../features/notifications/types.ts'
import { formatNaira } from '../../../../lib/format.ts'
import { childName } from '../../family.ts'
import { assignmentState } from '../tests/assignments.ts'

/**
 * The household's own half of the feed, worked out from what the school holds.
 *
 * The other half is the notice board — things somebody wrote — and these are
 * not: each item is a record that already exists, read as the event that
 * produced it. Bills raised against a child, money the bursary has taken, and
 * papers set for a child's class. Both lists are ones the parent's pages
 * already ask for on the same keys, so the bell costs no request they were not
 * making anyway.
 *
 * **Attendance is deliberately absent.** A day a child was marked away is the
 * one thing a guardian most wants told, and
 * `sparents/my-children/{id}/attendance` answers `{ attendance: [] }` for
 * every child in the school — so a feed built on it would say nothing while
 * looking as though it had checked. Put it back the moment a register is
 * being taken.
 */

/** Every child's name is on their own invoice, so nothing has to be joined. */
function billedTo(invoice: FamilyInvoice): string {
  return invoice.student?.trim() || `Pupil ${invoice.student_id}`
}

function billNotice(invoice: FamilyInvoice, now: Date): Notification | null {
  const at = schoolMillis(invoice.createdate)
  if (at === null) return null

  const settled = invoice.paystatus === SETTLED
  return {
    id: `bill-${invoice.id}`,
    kicker: 'Finance',
    title: `${formatNaira(Number(invoice.amount) || 0)} was billed for ${billedTo(invoice)}`,
    body: `${[invoice.fee?.trim(), invoice.session?.trim()].filter(Boolean).join(' · ')}. ${
      settled ? 'This one is settled.' : 'It is still outstanding.'
    }`,
    when: noticeWhen(at, now),
    group: noticeGroup(at, now),
    at,
    to: '/parent/invoices',
  }
}

/**
 * The day a bill was settled, which is its own event.
 *
 * The household's ledger carries no payment list — only `payday` on the bill
 * that was cleared — so this is read off the invoice rather than a receipt.
 * A bill raised and settled on the same day is still two items: the guardian
 * paid on one of them and wants to see it land.
 */
function settledNotice(invoice: FamilyInvoice, now: Date): Notification | null {
  if (invoice.paystatus !== SETTLED) return null
  const at = schoolMillis(invoice.payday)
  if (at === null) return null

  return {
    id: `settled-${invoice.id}`,
    kicker: 'Finance',
    title: `${formatNaira(Number(invoice.amount) || 0)} was received`,
    body: `${invoice.fee?.trim() || `Invoice #${invoice.id}`} for ${billedTo(
      invoice,
    )} is paid in full. Nothing is outstanding on it.`,
    when: noticeWhen(at, now),
    group: noticeGroup(at, now),
    at,
    to: '/parent/invoices',
  }
}

/**
 * When a paper last did something. The newest of its two moments that has
 * actually passed — so one that opens next week is not news yet.
 */
function paperAt(paper: ChildAssignmentPaper, now: number): number | null {
  const moments = [schoolMillis(paper.opendate), schoolMillis(paper.closedate)].filter(
    (moment): moment is number => moment !== null && moment <= now,
  )
  return moments.length > 0 ? Math.max(...moments) : null
}

/**
 * What to say about a paper, from the state the register already works out.
 *
 * 'Completed' is the API's own word and means the child sat it. 'Closed' is
 * worked out here rather than sent — the endpoint does not re-check its own
 * clock — and is the one worth telling a guardian about.
 */
const PAPER_COPY: Record<string, (name: string, child: string) => string> = {
  Available: (name, child) => `${name} is open for ${child}`,
  Completed: (name, child) => `${child} sat ${name}`,
  Closed: (name, child) => `${name} closed without ${child}'s answers`,
}

function paperNotice(
  paper: ChildAssignmentPaper,
  child: string,
  now: Date,
): Notification | null {
  const at = paperAt(paper, now.getTime())
  const line = PAPER_COPY[assignmentState(paper, now)]
  if (at === null || !line) return null

  const name = paper.title?.trim() || `Test ${paper.setassignment_id}`
  const closes = paper.closedate
    ? `Closes ${when(schoolTime(paper.closedate), true)}.`
    : 'No closing time was set.'

  return {
    // Two children in the same class are set the same paper, so the child is
    // part of the key as well as the sentence.
    id: `paper-${paper.setassignment_id}-${child}`,
    kicker: 'Assessment',
    title: line(name, child),
    body: `${paper.subject?.trim() || 'No subject named'}. ${closes}`,
    when: noticeWhen(at, now),
    group: noticeGroup(at, now),
    at,
    to: '/parent/tests',
  }
}

/** Everything the household has to be told about, newest first. */
export function parentNotices(
  invoices: FamilyInvoice[],
  papers: ChildAssignment[],
  now: Date,
): Notification[] {
  return mergedFeed(
    invoices.flatMap((invoice) => billNotice(invoice, now) ?? []),
    invoices.flatMap((invoice) => settledNotice(invoice, now) ?? []),
    papers.flatMap((entry) =>
      entry.assignments.flatMap(
        (paper) => paperNotice(paper, childName(entry.student), now) ?? [],
      ),
    ),
  )
}
