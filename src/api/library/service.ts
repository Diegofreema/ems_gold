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
 * Every lending read wears an envelope, and **not the same one**: `/loanedbooks`
 * and `/admins/borrowed-books` answer under `loans`, `/loanedbooks/overdue`
 * under `overdue`, `/loanedbooks/{id}` under `loan`. Read off bronze
 * 2026-09-15; the `data` and bare-array fallbacks are what was guessed before
 * that and are kept because they cost a line.
 */
function asLoans(answer: unknown): Loan[] {
  if (Array.isArray(answer)) return answer as Loan[]
  const wrapped = answer as { loans?: Loan[]; overdue?: Loan[]; data?: Loan[] } | null
  const loans = wrapped?.loans ?? wrapped?.overdue ?? wrapped?.data
  // An answer wearing none of the known shapes is a fault, not an empty
  // register: this list is the complete state of a set on the device, and a
  // fault read as "no loans" would erase the device's copy of the lending
  // register.
  if (!Array.isArray(loans)) {
    throw new Error('The server sent the loans in a shape this app cannot read.')
  }
  return loans
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

  /**
   * Overdue loans, under `overdue` rather than `loans`, beside a `count` and a
   * `fines_if_returned_today` total. The rows are the same flat shape the
   * register reads, so the envelope is all that differs — and it is why this
   * threw before the answer had been looked at.
   */
  overdue: () => request<unknown>('loanedbooks/overdue').then(asLoans),

  /** Every borrowing with the pupil and the title expanded; no pagination. */
  borrowedBooks: () =>
    request<unknown>('admins/borrowed-books').then(asLoans),

  /** Copies minus loans not yet returned. `available` is the truth. */
  stock: (bookId: Id) =>
    request<BookStock | { stock?: BookStock }>(`loanedbooks/stock/${bookId}`).then(
      (answer) => ('stock' in answer && answer.stock ? answer.stock : (answer as BookStock)),
    ),

  /**
   * Lends one copy of one title, off the book rather than off the register:
   * `POST /admins/books/{bookId}/lend`. 409 with a reason — a book already
   * out, a fine owing, or no copy left.
   */
  lend: (bookId: Id, body: LendBody) =>
    request<unknown>(`admins/books/${bookId}/lend`, { method: 'POST', body }),

  /**
   * Marks the copy returned and lends again — `POST /admins/books/{bookId}/return`,
   * off the book like lending and not off the loan. 409 if already back.
   */
  returnLoan: (bookId: Id, body: ReturnLoanBody) =>
    request<unknown>(`admins/books/${bookId}/return`, { method: 'POST', body }),

  /** Settles the money only — the book stays out until `returnLoan`. */
  payFine: (id: Id, body: PayFineBody = {}) =>
    request<unknown>(`loanedbooks/${id}/pay`, { method: 'POST', body }),

  /** Only the due date and condition; `returned` and `paid` have their own. */
  correctLoan: (id: Id, body: CorrectLoanBody) =>
    request<unknown>(`loanedbooks/${id}`, { method: 'POST', body }),

  /** One student's history, with `may_borrow`. Office, student or guardian only. */
  studentLoans: (studentId: Id) =>
    request<unknown>(`loanedbooks/student/${studentId}`).then(asHistory),

  /** The signed-in student's own borrowings. */
  myLoans: () => request<unknown>('loanedbooks/mine').then(asLoans),

  /** Deletes the record; an outstanding copy goes back on the shelf itself. */
  removeLoan: (id: Id) => request<unknown>(`loanedbooks/${id}`, { method: 'DELETE' }),
}
