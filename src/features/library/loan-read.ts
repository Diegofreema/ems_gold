import type { Loan } from '../../api/library/types.ts'
import { BLANK } from '../collections/blank.ts'

/**
 * Reading one borrowing off `/loanedbooks`, shared by the office's lending
 * register and the pupil's own page.
 *
 * The controller's live rows have not been read yet, so every field is taken
 * by the contract's own name first and then by the obvious variants — a name
 * flattened beside the ids, or nested as a record. When a live answer pins the
 * shape down, the fallbacks it does not use can come off.
 */

/** The first candidate that actually says something. */
export function first(...values: (string | null | undefined)[]): string {
  for (const value of values) if (value?.trim()) return value.trim()
  return ''
}

/** The pupil, whichever way the row spells them. */
export function loanStudent(loan: Loan): string {
  const parts = loan.student
    ? [loan.student.fname, loan.student.mname, loan.student.lname]
        .filter(Boolean)
        .join(' ')
        .trim()
    : ''
  return (
    first(loan.student_name, parts, loan.student?.name) ||
    (loan.student_id != null ? `Student ${loan.student_id}` : BLANK)
  )
}

/** The title, whichever way the row spells it. */
export function loanBook(loan: Loan): string {
  return (
    first(loan.book_title, loan.book?.title, loan.title) ||
    (loan.book_id != null ? `Book ${loan.book_id}` : BLANK)
  )
}

/** The fine as a figure, off whichever key carries it. NaN where none does. */
export function loanFine(loan: Loan): number {
  const raw = loan.fine ?? loan.penalty
  if (raw == null || raw === '') return Number.NaN
  return Number(raw)
}

/** The due date as the API wrote it, or nothing. */
export function loanDue(loan: Loan): string {
  return first(loan.due_date, loan.toreturn)
}

/**
 * Out, Overdue or Returned — the one word the registers colour.
 *
 * Overdue is worked out here rather than trusted to a flag the list does not
 * carry: past the due date and not back is the whole of the definition, and
 * the date arrives on the school's own clock.
 */
export function loanStanding(loan: Loan, today: Date): string {
  if (loan.returned === 'Yes') return 'Returned'
  const due = loanDue(loan)
  if (due) {
    const at = new Date(due)
    // The whole due day is still on time: a book due today is not late yet.
    at.setHours(23, 59, 59, 999)
    if (!Number.isNaN(at.getTime()) && at < today) return 'Overdue'
  }
  return 'Out'
}

/** Paid, Owing, or nothing where no fine ever arose. */
export function loanPaid(loan: Loan): string {
  if (loan.paid === 'Yes') return 'Paid'
  const fine = loanFine(loan)
  return Number.isFinite(fine) && fine > 0 ? 'Owing' : BLANK
}
