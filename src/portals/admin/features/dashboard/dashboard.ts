import type { Invoice } from '../../../../api/invoices/types.ts'
import type { ActivityLog } from '../../../../api/logs/types.ts'
import type { SpendingMonth } from '../../../../api/spendings/types.ts'
import type { DashboardStats } from '../../../../api/users/types.ts'
import { formatCount } from '../../../../lib/format.ts'
import { SETTLED } from '../../collections/invoice-row.ts'
import { logAuthor } from '../../collections/log-row.ts'
import { monthKey, spentIn } from '../../collections/spending-row.ts'

/*
 * The tiles, the bars and the feed entries are typed by the components that
 * draw them, and those are `.tsx` — which this module cannot import, because
 * the test runner type-strips `.ts` alone. Nothing is redeclared here to work
 * around it: the shapes are inferred, and `api/dashboard.ts` assigns them into
 * the components' own types, so a change to either side fails the build there.
 * The one thing inference cannot keep is `format`, which is a union of two
 * words rather than a string, so the two builders below pin it.
 */

/** A figure written as money, counting up on mount. */
function moneyTile(label: string, amount: number, delta: string, hot = false) {
  return { label, amount, format: 'naira' as const, delta, hot }
}

/** A figure written as a plain total. */
function countTile(label: string, amount: number, delta: string, hot = false) {
  return { label, amount, format: 'number' as const, delta, hot }
}

/** "1 invoice", "12 invoices" — a delta line is prose, not a column. */
function counted(amount: number, one: string, many: string): string {
  return `${formatCount(amount)} ${amount === 1 ? one : many}`
}

/** The API sends money as a string; anything unreadable is nothing. */
function money(amount: string | number | null | undefined): number {
  const parsed = Number(amount)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * What the invoice ledger comes to, in figures that add up: `billed` is
 * `collected` plus `outstanding` and always will be, because this API has no
 * part payment — an invoice is settled for its whole amount or for nothing.
 */
export type Ledger = {
  billed: number
  collected: number
  outstanding: number
  /** Invoices raised, and how many of those are still owing. */
  raised: number
  owing: number
}

export function ledgerTotals(invoices: Invoice[]): Ledger {
  const ledger: Ledger = { billed: 0, collected: 0, outstanding: 0, raised: 0, owing: 0 }
  for (const invoice of invoices) {
    const amount = money(invoice.amount)
    const settled = invoice.paystatus === SETTLED
    ledger.billed += amount
    ledger.raised += 1
    if (settled) ledger.collected += amount
    else {
      ledger.outstanding += amount
      ledger.owing += 1
    }
  }
  return ledger
}

/**
 * The four money figures, all off ledgers that reconcile with one another —
 * three from the invoice register and the fourth from the spending summary.
 */
export function financeFigures(ledger: Ledger, months: SpendingMonth[], today: Date) {
  const rate = ledger.billed ? Math.round((ledger.collected / ledger.billed) * 100) : 0
  const month = spentIn(months, monthKey(today))

  return [
    moneyTile(
      'Billed to date',
      ledger.billed,
      `${counted(ledger.raised, 'invoice', 'invoices')} raised`,
    ),
    moneyTile('Collected', ledger.collected, `${rate}% of everything billed`),
    moneyTile(
      'Outstanding',
      ledger.outstanding,
      `${counted(ledger.owing, 'invoice', 'invoices')} still owing`,
      // Money owed is only worth flagging while some is owed.
      ledger.owing > 0,
    ),
    moneyTile(
      'Spent this month',
      month.total,
      month.entries ? counted(month.entries, 'entry', 'entries') : 'Nothing recorded yet',
    ),
  ]
}

/** The four counts a head teacher looks at, from the dashboard endpoint. */
export function peopleFigures(stats: DashboardStats) {
  return [
    countTile(
      'Pupils enrolled',
      stats.students,
      `Across ${counted(stats.classes, 'class', 'classes')}`,
    ),
    countTile(
      'Applicants',
      stats.applied,
      stats.applied ? 'Awaiting a decision' : 'None waiting on a decision',
      stats.applied > 0,
    ),
    countTile(
      'Teachers',
      stats.teachers,
      `${counted(stats.subjects, 'subject', 'subjects')} on the timetable`,
    ),
    countTile('Parents', stats.parents, 'Guardian logins'),
  ]
}

/**
 * What the school is made of. Secondary to the money and the people above it,
 * so these are the small tiles rather than the counting ones.
 */
export function schoolTiles(stats: DashboardStats) {
  return [
    { label: 'Classes', value: formatCount(stats.classes) },
    { label: 'Subjects', value: formatCount(stats.subjects) },
    { label: 'Hostels', value: formatCount(stats.hostels) },
    { label: 'Administrators', value: formatCount(stats.admins) },
  ]
}

/**
 * The month an invoice was settled in, or nothing.
 *
 * `payday` is written three ways by this API and the oldest of them —
 * `24 Oct 2022 19:02 pm` — will not parse at all. Those rows are years old and
 * fall outside any window this chart draws, so an unreadable date is left out
 * rather than guessed at.
 */
function settledMonth(invoice: Invoice): string | undefined {
  if (invoice.paystatus !== SETTLED || !invoice.payday) return undefined
  const at = new Date(invoice.payday)
  return Number.isNaN(at.getTime()) ? undefined : monthKey(at)
}

/** "₦1.3m", "₦90k", "₦0" — a bar caption has room for three characters. */
export function compactNaira(amount: number): string {
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}m`
  if (amount >= 1_000) return `₦${Math.round(amount / 1_000)}k`
  return `₦${Math.round(amount)}`
}

/**
 * Fee collections by month, the last `span` months ending with this one.
 *
 * Every month in the window gets a bar, including the ones nothing came in on:
 * a quiet month is a fact about the term, and dropping it would leave the axis
 * lying about which months these are. The biggest is drawn in accent.
 */
export function collectionBars(invoices: Invoice[], today: Date, span = 6) {
  const totals = new Map<string, number>()
  for (const invoice of invoices) {
    const month = settledMonth(invoice)
    if (month) totals.set(month, (totals.get(month) ?? 0) + money(invoice.amount))
  }

  const window: { label: string; value: number }[] = []
  for (let back = span - 1; back >= 0; back -= 1) {
    const at = new Date(today.getFullYear(), today.getMonth() - back, 1)
    window.push({
      label: at.toLocaleString('en-NG', { month: 'short' }),
      value: totals.get(monthKey(at)) ?? 0,
    })
  }

  const best = Math.max(...window.map((month) => month.value))
  return {
    bars: window.map((month) => ({
      label: month.label,
      value: month.value,
      display: compactNaira(month.value),
      // Nothing to single out on a term where nothing was collected.
      highlight: best > 0 && month.value === best,
    })),
    // A flat chart would divide by zero; one naira of headroom draws it flat.
    peak: best || 1,
  }
}

/** Two dates are the same day on the reader's clock, which is the school's. */
function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/**
 * When an entry happened, as a feed says it: the clock time today, "Yesterday"
 * for the day before, and the date itself for anything older. A timestamp that
 * will not parse is shown as it was sent rather than as "Invalid Date".
 */
export function activityWhen(timestamp: string, now: Date): string {
  const at = new Date(timestamp)
  if (Number.isNaN(at.getTime())) return timestamp
  if (sameDay(at, now)) {
    return at.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
  if (sameDay(at, yesterday)) return 'Yesterday'
  return at.toLocaleDateString('en-NG', { day: '2-digit', month: 'short' })
}

/**
 * The audit log as the dashboard feed. Deletions are flagged: they are the one
 * entry type nobody can undo from a screen, so they are what a bursar wants to
 * catch on the way past.
 */
export function activityEntries(logs: ActivityLog[], now: Date) {
  return logs.map((log) => ({
    id: String(log.id),
    text: log.description?.trim() || log.title?.trim() || 'Something happened',
    who: logAuthor(log),
    when: activityWhen(log.timestamp, now),
    flagged: log.type === 'Delete',
  }))
}
