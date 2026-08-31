import type { Invoice } from '../../../../api/invoices/types.ts'
import type { StudentDashboard } from '../../../../api/my-schooling/types.ts'
import { money, named, SETTLED } from '../../../../features/collections/invoice.ts'
import { newestFirst } from '../../../../features/collections/newest.ts'
import { schoolTime, when } from '../../../../features/collections/when.ts'
import { formatNaira } from '../../../../lib/format.ts'
import { paidTotal, reference } from '../fees/fees.ts'

/**
 * The pupil's home page, off `GET /students/me/dashboard` and
 * `GET /students/me/invoices`.
 *
 * Six endpoints answer a pupil login and no more: the record, five counters,
 * their invoices, and three lists — courses, results and materials — that are
 * empty for every pupil on this school. So the design's two panels are not
 * buildable as drawn: a term average needs a published result, and the week
 * ahead needs a timetable, which is not an endpoint here at all. The money
 * the school has actually taken from this pupil is what the page shows
 * instead, and it is the one thing on it a pupil would check twice.
 */

export type StudentStats = NonNullable<StudentDashboard['stats']>

/** "1 invoice", "3 invoices" — a delta line is prose, not a column. */
function counted(amount: number, one: string, many: string): string {
  return `${amount} ${amount === 1 ? one : many}`
}

/**
 * The four counters across the top.
 *
 * The unpaid one is the only figure here a pupil can act on, so it is the only
 * one ever flagged. Neither a term average nor a position is among them: no
 * result has been published to this pupil, and a figure invented from an empty
 * list would be the one believed.
 */
export function studentFigures(stats: StudentStats, invoices: Invoice[]) {
  const count = (label: string, amount: number, delta: string, hot = false) =>
    ({ label, amount, format: 'number' as const, delta, hot })

  return [
    {
      label: 'Paid this session',
      amount: paidTotal(invoices),
      format: 'naira' as const,
      delta: counted(stats.fees_settled_this_session, 'invoice', 'invoices') + ' settled',
      // Never flagged: money already taken is not something a pupil can act on.
      hot: false,
    },
    count(
      'Invoices unpaid',
      stats.invoices_unpaid,
      stats.invoices_unpaid
        ? `Of ${counted(stats.invoices_total, 'invoice', 'invoices')} raised for you`
        : 'Nothing owing',
      stats.invoices_unpaid > 0,
    ),
    count(
      'Results published',
      stats.results_available,
      stats.results_available ? 'Approved by the office' : 'None approved yet',
    ),
    count(
      'Course materials',
      stats.materials_available,
      stats.materials_available ? 'Shared by your teachers' : 'Nothing shared yet',
    ),
  ]
}

/**
 * The line under the greeting. Fees lead, because they are the only thing on
 * this page that is a task rather than a figure.
 */
export function studentNote(stats: StudentStats): string {
  const fees = stats.invoices_unpaid
    ? `${counted(stats.invoices_unpaid, 'invoice', 'invoices')} of yours ${stats.invoices_unpaid === 1 ? 'is' : 'are'} still unpaid.`
    : 'Every invoice raised for you has been paid.'
  const results = stats.results_available
    ? `${counted(stats.results_available, 'result is', 'results are')} ready to read.`
    : 'No result has been published to you yet.'

  return `${fees} ${results}`
}

export type StudentAction = {
  to: '/student/invoices' | '/student/results'
  label: string
}

/** The button beside the greeting points at whatever is waiting. */
export function studentAction(stats: StudentStats): StudentAction {
  return stats.invoices_unpaid
    ? { to: '/student/invoices', label: 'My invoices' }
    : { to: '/student/results', label: 'My results' }
}

/** The bills the school has raised for this pupil, newest first. */
export function billEntries(invoices: Invoice[]) {
  return newestFirst(invoices).map((invoice) => {
    const settled = invoice.paystatus === SETTLED

    return {
      id: String(invoice.id),
      text: named(invoice.fee, 'name') || `Invoice ${invoice.id}`,
      who: [formatNaira(money(invoice.amount)), reference(invoice), named(invoice.session, 'name')]
        .filter(Boolean)
        .join(' · '),
      when: settled ? `Paid ${when(schoolTime(invoice.payday), true)}` : 'Not paid',
      flagged: !settled,
    }
  })
}

/**
 * What the list leaves out.
 *
 * `GET /students/me/invoices` returns settled bills only and ignores every
 * filter offered to it, so the counters and the list disagree on purpose. The
 * pupil is told that rather than left to count the rows and wonder.
 */
export function unlistedNote(stats: StudentStats, listed: number): string | null {
  const missing = stats.invoices_total - listed
  if (missing <= 0) return null

  return `${counted(missing, 'invoice', 'invoices')} the school has raised for you ${
    missing === 1 ? 'is' : 'are'
  } not listed here. Ask the bursary for ${missing === 1 ? 'it' : 'them'}.`
}

/** Each settled bill as a bar, so a pupil can see where the money went. */
export function feeBars(invoices: Invoice[]) {
  const bars = newestFirst(invoices)
    .filter((invoice) => invoice.paystatus === SETTLED)
    .map((invoice) => {
      const amount = money(invoice.amount)
      return {
        label: shortFee(named(invoice.fee, 'name')) || reference(invoice),
        value: amount,
        display: formatNaira(amount),
      }
    })

  return { bars, peak: Math.max(1, ...bars.map((bar) => bar.value)) }
}

/**
 * A fee's name as a bar's label. The school names its fees "TUITION FEE" and
 * "BUS FEE", and the word they share is the one the chart is already about.
 */
function shortFee(name: string): string {
  return name.replace(/\s*fees?$/i, '').trim().toUpperCase()
}
