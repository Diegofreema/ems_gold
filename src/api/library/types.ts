export type Book = {
  id: number
  title: string
  author: string
  pubdate: string | null
  /** The API spells availability as a word, not a boolean. */
  isavailable: 'Available' | 'Unavailable'
  date_created: string
  user_id: number
  isbn: string | null
  coverphoto: string | null
  copies: number
  section: string | null
  callno: number | string | null
  department_id: number | null
}

/**
 * `POST /admins/books`. Multipart on the wire — `bookimage` is a cover
 * upload — though the add-title flow sends no file; nothing displays covers.
 */
export type BookBody = {
  title?: string
  author?: string
  isbn?: string
  isavailable?: Book['isavailable']
  department_id?: number
  copies?: number
  callno?: number | string
  section?: string
  pubdate?: string
  bookimage?: File
}

/** Substring match on each field; all three are optional. */
export type BookSearchParams = {
  booktitle?: string
  bookauthor?: string
  isbn?: string
}

/*
 * Lending, under `/loanedbooks`. A borrowing is its own record with its own
 * id — returns, fines and corrections are all keyed on the loan, never on the
 * book. Availability is copies minus loans not yet returned; the catalogue's
 * `isavailable` is only the office's lending switch.
 *
 * The controller's live answers have not been read yet: the field names below
 * are the contract's own, and the readers over them tolerate the obvious
 * variants (a name flattened or nested) until a live row pins the shape down.
 */

/** One borrowing. `returned` and `paid` are the words 'Yes' and 'No'. */
export type Loan = {
  id: number
  student_id?: number | null
  /** The pupil's name, however the controller sends it — flat or as a record. */
  student_name?: string | null
  student?: {
    id?: number | null
    name?: string | null
    fname?: string | null
    mname?: string | null
    lname?: string | null
    regno?: string | null
  } | null
  book_id?: number | null
  book_title?: string | null
  book?: { id?: number | null; title?: string | null; author?: string | null } | null
  title?: string | null
  returned?: string | null
  paid?: string | null
  /** ISO dates on the school's wall clock, like everything else on bronze. */
  due_date?: string | null
  toreturn?: string | null
  returned_on?: string | null
  borrowed_on?: string | null
  date_created?: string | null
  dateadded?: string | null
  /** The state the book came back in. */
  condition?: string | null
  status?: string | null
  /** Days late × the library's fine per day. */
  fine?: number | string | null
  penalty?: number | string | null
  /** On `/loanedbooks/{id}` — what the desk quotes before the handover. */
  penalty_if_returned_today?: number | string | null
}

/**
 * `/loanedbooks/summary` — what is out, late and owed, and the fine rate.
 * Exposed but not yet read into any page: its key names have not been seen,
 * and the tiles count the list they already hold instead.
 */
export type LoanSummary = Record<string, unknown>

/** `/loanedbooks/stock/{bookId}`. `available` is the number to trust. */
export type BookStock = {
  available?: number | null
  /** The catalogue's `isavailable` text, along for the ride. */
  label?: string | null
  copies?: number | null
}

/**
 * `POST /loanedbooks`. `toreturn` left out lends for the school's own
 * `Library.loanDays`. Refused with 409 — and a reason — where the pupil
 * already has a book out, owes a fine, or no copy is on the shelf.
 */
export type LendBody = {
  studentId: number
  bookId: number
  /** YYYY-MM-DD. */
  toreturn?: string
}

/** `POST /loanedbooks/{loanId}/return`. 409 where already returned. */
export type ReturnLoanBody = {
  /** The condition the book came back in. */
  status?: string
  /** YYYY-MM-DD, to backdate the return. Left out, it is today. */
  returned_on?: string
}

/** `POST /loanedbooks/{loanId}/pay` — the money only, never the book. */
export type PayFineBody = {
  /** Left out, the full fine as it stands is taken. */
  amount?: number
}

/** `POST /loanedbooks/{loanId}` — only these two are correctable here. */
export type CorrectLoanBody = {
  due_date?: string
  condition?: string
}

/**
 * `/loanedbooks/student/{studentId}` — one pupil's borrowing history, with the
 * flag a client reads to disable the borrow button before the desk tries.
 * `may_borrow` is undefined where the answer did not carry it, and the desk
 * then simply asks the lend endpoint, which answers with its own reason.
 */
export type StudentLoanHistory = {
  may_borrow?: boolean
  loans: Loan[]
}
