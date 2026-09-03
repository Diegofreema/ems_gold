import { request, toFormData } from '../client'
import type { Id } from '../types'
import type {
  Book,
  BookBody,
  BookSearchParams,
  BookStock,
  CorrectLoanBody,
  LendBody,
  Loan,
  LoanSummary,
  PayFineBody,
  ReturnLoanBody,
  StudentLoanHistory,
} from './types'

/**
 * The lending endpoints have not answered live yet, so each read is unwrapped
 * by whichever key it turns out to use — the bare shape, or a `loans` / `loan`
 * envelope like the rest of bronze wears — rather than betting the page on one.
 */
function asLoans(answer: unknown): Loan[] {
  if (Array.isArray(answer)) return answer as Loan[]
  const wrapped = answer as { loans?: Loan[]; data?: Loan[] } | null
  return wrapped?.loans ?? wrapped?.data ?? []
}

function asLoan(answer: unknown): Loan {
  const wrapped = answer as { loan?: Loan; data?: Loan } | null
  return wrapped?.loan ?? wrapped?.data ?? (answer as Loan)
}

function asHistory(answer: unknown): StudentLoanHistory {
  const wrapped = answer as { data?: unknown } | null
  const inner = (wrapped?.data ?? answer) as { may_borrow?: unknown } | null
  return {
    may_borrow: typeof inner?.may_borrow === 'boolean' ? inner.may_borrow : undefined,
    loans: asLoans(inner),
  }
}

export const libraryService = {
  /**
   * The catalogue, whole — the endpoint ignores paging. Read for the issue
   * flow's book picker; the catalogue has no page of its own any more, and
   * the add and edit flows are the only writers left against it.
   */
  books: (params: BookSearchParams = {}) =>
    request<{ books: Book[] }>('admins/books', { query: { ...params } }).then(
      (data) => data.books,
    ),

  /** A new title on the shelf. Multipart, since the endpoint takes a cover. */
  addBook: (body: BookBody) =>
    request<{ book: Book }>('admins/books', { method: 'POST', form: toFormData(body) }),

  /**
   * Changes a title. Sent whole rather than as a diff — whether the endpoint
   * updates partially has never been proved, so the edit flow merges what was
   * typed over the record it fetched and sends everything.
   */
  updateBook: (id: Id, body: BookBody) =>
    request<{ book: Book }>(`admins/books/${id}`, { method: 'POST', form: toFormData(body) }),

  /** Every borrowing, newest first. */
  loans: () => request<unknown>('loanedbooks').then(asLoans),

  /** One borrowing, with `penalty_if_returned_today` for the desk to quote. */
  loan: (id: Id) => request<unknown>(`loanedbooks/${id}`).then(asLoan),

  /** What is out, late and owed, and the fine rate. Keys not yet read. */
  summary: () => request<LoanSummary>('loanedbooks/summary'),

  /** Overdue loans with the fine accrued so far. */
  overdue: () => request<unknown>('loanedbooks/overdue').then(asLoans),

  /** Copies minus loans not yet returned. `available` is the truth. */
  stock: (bookId: Id) =>
    request<BookStock | { stock?: BookStock }>(`loanedbooks/stock/${bookId}`).then(
      (answer) => ('stock' in answer && answer.stock ? answer.stock : (answer as BookStock)),
    ),

  /** 409 with a reason: a book already out, a fine owing, or no copy left. */
  lend: (body: LendBody) => request<unknown>('loanedbooks', { method: 'POST', body }),

  /** Marks the loan returned and the copy lends again. 409 if already back. */
  returnLoan: (id: Id, body: ReturnLoanBody) =>
    request<unknown>(`loanedbooks/${id}/return`, { method: 'POST', body }),

  /** Settles the money only — the book stays out until `returnLoan`. */
  payFine: (id: Id, body: PayFineBody = {}) =>
    request<unknown>(`loanedbooks/${id}/pay`, { method: 'POST', body }),

  /** Only the due date and condition; `returned` and `paid` have their own. */
  correctLoan: (id: Id, body: CorrectLoanBody) =>
    request<unknown>(`loanedbooks/${id}`, { method: 'POST', body }),

  /** One pupil's history, with `may_borrow`. Office, pupil or guardian only. */
  studentLoans: (studentId: Id) =>
    request<unknown>(`loanedbooks/student/${studentId}`).then(asHistory),

  /** The signed-in pupil's own borrowings. */
  myLoans: () => request<unknown>('loanedbooks/mine').then(asLoans),

  /** Deletes the record; an outstanding copy goes back on the shelf itself. */
  removeLoan: (id: Id) => request<unknown>(`loanedbooks/${id}`, { method: 'DELETE' }),
}
