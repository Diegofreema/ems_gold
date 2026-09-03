import type { Loan } from '../../../api/library/types.ts'
import { BLANK } from '../../../features/collections/blank.ts'
import {
  first,
  loanBook,
  loanDue,
  loanFine,
  loanPaid,
  loanStanding,
  loanStudent,
} from '../../../features/library/loan-read.ts'
import type { Row } from '../../../features/collections/types.ts'
import { when } from '../../../features/collections/when.ts'
import { formatNaira } from '../../../lib/format.ts'

/**
 * One borrowing as the lending register reads it. The reading itself —
 * which key carries the name, when a loan counts as overdue — lives in
 * `features/library/loan-read`, shared with the pupil's own page.
 */

function text(value: string | null | undefined): string {
  return value?.trim() || BLANK
}

export { loanBook, loanFine, loanPaid, loanStanding, loanStudent }

export function loanRow(loan: Loan, today = new Date()): Row {
  const fine = loanFine(loan)
  return {
    id: String(loan.id),
    student: loanStudent(loan),
    book: loanBook(loan),
    due: when(loanDue(loan) || null),
    standing: loanStanding(loan, today),
    fine: Number.isFinite(fine) && fine > 0 ? formatNaira(fine) : BLANK,
    paid: loanPaid(loan),

    // Read by the record panel and the flows, not by the table.
    // The date as the API wrote it, for the correction form to open on.
    due_raw: loanDue(loan),
    borrowed: when(first(loan.borrowed_on, loan.date_created, loan.dateadded) || null),
    returned_on: when(loan.returned_on),
    condition: text(first(loan.condition, loan.status) || null),
    // What the desk quotes before the handover. On the detail answer only.
    penalty_today:
      loan.penalty_if_returned_today != null && loan.penalty_if_returned_today !== ''
        ? formatNaira(Number(loan.penalty_if_returned_today))
        : BLANK,
  }
}

/** What is lost with the record — and what the API quietly puts back. */
export function loanDeleteBody(row: Row): string {
  return `The record of ${row.book} against ${row.student} is deleted. If the copy is still out, it goes back on the shelf as if never lent — the fine goes with the record.`
}
