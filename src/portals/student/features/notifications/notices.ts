import type { Assignment } from '../../../../api/assignments/types.ts'
import type { Invoice } from '../../../../api/invoices/types.ts'
import type { MyPayment, MyResult } from '../../../../api/my-schooling/types.ts'
import { money, named, SETTLED } from '../../../../features/collections/invoice.ts'
import { schoolMillis, schoolTime, when } from '../../../../features/collections/when.ts'
import {
  mergedFeed,
  noticeGroup,
  noticeWhen,
} from '../../../../features/notifications/notice-feed.ts'
import type { Notification } from '../../../../features/notifications/types.ts'
import { formatNaira } from '../../../../lib/format.ts'
import { termOf } from '../results/results.ts'
import { stateOf } from '../tests/tests.ts'

/**
 * The pupil's own half of the feed, worked out from what the school holds.
 *
 * The other half is the notice board — things somebody wrote — and these are
 * not: each item is a record that already exists, read as the event that
 * produced it. Papers set for the class, marks the office has published, bills
 * raised and money taken. All three lists are ones the pupil's own pages
 * already ask for on the same keys, so the bell costs no request they were not
 * making anyway.
 *
 * Nothing here invents a deadline or a reminder. A paper that has not opened
 * yet is not on the feed at all: it has not happened, and a feed ordered by
 * time has nowhere to put something that is still to come.
 */

/**
 * When a paper last did something. The newest of its two moments that has
 * actually passed — so a paper is news for having opened, and news again for
 * having closed, and one that opens on Monday is news neither way yet.
 */
function paperAt(paper: Assignment, now: number): number | null {
  const moments = [schoolMillis(paper.opendate), schoolMillis(paper.closedate)].filter(
    (moment): moment is number => moment !== null && moment <= now,
  )
  return moments.length > 0 ? Math.max(...moments) : null
}

/** What the paper is called, whether or not the teacher named it. */
function paperName(paper: Assignment): string {
  return paper.title?.trim() || `Test ${paper.id}`
}

const PAPER_COPY: Record<string, { title: (name: string) => string; tail: string }> = {
  Open: {
    title: (name) => `${name} is open for you`,
    tail: 'Sit it before it closes; you only get one attempt.',
  },
  Submitted: {
    title: (name) => `You sat ${name}`,
    tail: 'Your score appears once a teacher has marked it.',
  },
  Missed: {
    title: (name) => `${name} closed without your answers`,
    tail: 'The window has passed. Speak to the teacher who set it.',
  },
}

function paperNotice(paper: Assignment, now: Date): Notification | null {
  const at = paperAt(paper, now.getTime())
  // 'Not open yet' has no copy, and no moment behind it either.
  const copy = PAPER_COPY[stateOf(paper, now.getTime())]
  if (at === null || !copy) return null

  const questions = paper.question_count ?? 0
  const closes = paper.closedate
    ? `Closes ${when(schoolTime(paper.closedate), true)}.`
    : 'No closing time was set.'

  return {
    id: `paper-${paper.id}`,
    kicker: 'Assessment',
    title: copy.title(paperName(paper)),
    body: `${[paper.subject?.trim(), `${questions} question${questions === 1 ? '' : 's'}`]
      .filter(Boolean)
      .join(' · ')}. ${closes} ${copy.tail}`,
    when: noticeWhen(at, now),
    group: noticeGroup(at, now),
    at,
    to: '/student/tests',
  }
}

/**
 * A term's results, not a subject's.
 *
 * A term is approved as a whole and every mark in it lands the same day, so
 * nine subjects are one thing that happened. The group is dated by its newest
 * mark, which is when the last of them was published.
 */
type TermResults = { term: string; count: number; at: number }

export function resultTerms(results: MyResult[]): TermResults[] {
  const terms = new Map<string, TermResults>()

  for (const result of results) {
    const at = schoolMillis(result.uploaddate)
    // A mark with no readable stamp has no place on a feed ordered by time.
    if (at === null) continue

    const term = termOf(result)
    const held = terms.get(term)
    if (!held) {
      terms.set(term, { term, count: 1, at })
      continue
    }
    held.count += 1
    held.at = Math.max(held.at, at)
  }

  return [...terms.values()]
}

function resultNotice(entry: TermResults, now: Date): Notification {
  const subjects = `${entry.count} subject${entry.count === 1 ? '' : 's'}`
  return {
    id: `results-${entry.term}`,
    kicker: 'Assessment',
    title: `${entry.term} results are out`,
    body: `${subjects} published. The office has approved these; they are final.`,
    when: noticeWhen(entry.at, now),
    group: noticeGroup(entry.at, now),
    at: entry.at,
    to: '/student/results',
  }
}

/** The name on the bill, or the fee id where the school did not expand one. */
function feeName(invoice: Invoice): string {
  return named(invoice.fee, 'name') || `Fee ${invoice.fee_id ?? invoice.id}`
}

function billNotice(invoice: Invoice, now: Date): Notification | null {
  const at = schoolMillis(invoice.createdate)
  if (at === null) return null

  const settled = invoice.paystatus === SETTLED
  return {
    id: `bill-${invoice.id}`,
    kicker: 'Finance',
    title: `${formatNaira(money(invoice.amount))} was billed to you`,
    body: `${feeName(invoice)}. ${
      settled ? 'This one is settled — nothing is outstanding on it.' : 'It is still owing.'
    }`,
    when: noticeWhen(at, now),
    group: noticeGroup(at, now),
    at,
    to: '/student/invoices',
  }
}

/**
 * Money the bursary has taken. Separate from the bill it settles, because the
 * two happen on different days and a pupil wants to see the second confirmed.
 */
function paymentNotice(payment: MyPayment, now: Date): Notification | null {
  const at = schoolMillis(payment.transdate)
  if (at === null) return null

  return {
    id: `payment-${payment.id}`,
    kicker: 'Finance',
    title: `${formatNaira(money(payment.amount))} was received`,
    body: `Receipt ${payment.payref?.trim() || `#${payment.id}`}. ${
      payment.notes?.trim() || 'The bursary has recorded this against your bill.'
    }`,
    when: noticeWhen(at, now),
    group: noticeGroup(at, now),
    at,
    to: '/student/invoices',
  }
}

/** Everything the pupil has to be told about, newest first. */
export function studentNotices(
  papers: Assignment[],
  results: MyResult[],
  invoices: Invoice[],
  payments: MyPayment[],
  now: Date,
): Notification[] {
  return mergedFeed(
    papers.flatMap((paper) => paperNotice(paper, now) ?? []),
    resultTerms(results).map((entry) => resultNotice(entry, now)),
    invoices.flatMap((invoice) => billNotice(invoice, now) ?? []),
    payments.flatMap((payment) => paymentNotice(payment, now) ?? []),
  )
}
