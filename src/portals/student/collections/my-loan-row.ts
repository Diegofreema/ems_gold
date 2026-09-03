import type { Loan } from '../../../api/library/types.ts'
import { BLANK } from '../../../features/collections/blank.ts'
import type { Row } from '../../../features/collections/types.ts'
import { when } from '../../../features/collections/when.ts'
import {
  first,
  loanBook,
  loanDue,
  loanFine,
  loanPaid,
  loanStanding,
} from '../../../features/library/loan-read.ts'
import { formatNaira } from '../../../lib/format.ts'

/**
 * One of the pupil's own borrowings, off `/loanedbooks/mine` — the same
 * reading as the office's lending register, minus the pupil column, because
 * every row here is theirs.
 */
export function myLoanRow(loan: Loan, today = new Date()): Row {
  const fine = loanFine(loan)
  return {
    id: String(loan.id),
    book: loanBook(loan),
    borrowed: when(first(loan.borrowed_on, loan.date_created, loan.dateadded) || null),
    due: when(loanDue(loan) || null),
    standing: loanStanding(loan, today),
    fine: Number.isFinite(fine) && fine > 0 ? formatNaira(fine) : BLANK,
    paid: loanPaid(loan),

    // Read by the record panel, not by the table.
    returned_on: when(loan.returned_on),
    condition: first(loan.condition, loan.status) || BLANK,
  }
}
