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
/**
 * One borrowing. **Read off bronze on 2026-09-15**, which is the first time any
 * of these rows had been seen, and they are two shapes rather than one:
 *
 * - `/loanedbooks`, `/loanedbooks/{id}` and `/loanedbooks/overdue` send a
 *   **flat** row — `book` is the *title as a string*, `student` is `null`, the
 *   dates are `borrowed` and `due`, and `returned`/`paid`/`overdue` are real
 *   booleans. This is what the office's register is drawn from.
 * - `/admins/borrowed-books` sends an **expanded** row — `book` is the whole
 *   catalogue record and `student` the whole pupil record, with `date` and
 *   `datetoreturn` for the dates and `status: "not returned"` in place of the
 *   flags.
 *
 * Both are typed here because both are live, and the readers in
 * `features/library/loan-read.ts` take either. What is *not* here any more is
 * the set of names the 2026-09-03 contract published and nothing sends:
 * `book_title`, `student_name`, `due_date`, `toreturn`, `borrowed_on`,
 * `date_created`, `dateadded`. They were read first by every reader, which is
 * why the register showed "Student 12" borrowing "Book 2" with no due date and
 * everything standing "Out".
 */
export type Loan = {
  id: number
  student_id?: number | null
  /** Expanded on `/admins/borrowed-books`; `null` on the flat shape. */
  student?: {
    id?: number | null
    fname?: string | null
    mname?: string | null
    lname?: string | null
    regno?: string | null
  } | null
  /** Flat on the loan controller, `null` beside the expanded pupil. */
  regno?: string | null
  book_id?: number | null
  /** The title as a string on the flat shape, the record on the expanded one. */
  book?: string | { id?: number | null; title?: string | null; author?: string | null } | null
  /** Flat: the day it went out. Expanded: `date`, a full timestamp. */
  borrowed?: string | null
  date?: string | null
  /** Flat: `due`. Expanded: `datetoreturn`. Both YYYY-MM-DD. */
  due?: string | null
  datetoreturn?: string | null
  returned_on?: string | null
  /** Booleans on the flat shape. */
  returned?: boolean | null
  paid?: boolean | null
  overdue?: boolean | null
  /** Whole days past the due date, the school's own arithmetic. */
  days_overdue?: number | null
  /** The expanded shape's words instead of the flags — "not returned". */
  status?: string | null
  /** The state the book came back in. */
  condition?: string | null
  /** The fine as it stands: 0 until the copy is actually back. */
  penalty?: number | string | null
  /** What the desk quotes before the handover. On the list as well as the record. */
  penalty_if_returned_today?: number | string | null
  /** Who issued it. */
  admin_id?: number | null
}

/**
 * `/loanedbooks/summary` — what is out, late and owed, and the school's own
 * lending rules. Keys read off bronze 2026-09-15:
 * `{loans, out, overdue, fines_owing, fine_per_day, loan_days}`.
 *
 * Still not what the Lending page's tiles read: they count the set on the
 * device, which is the rule for every counted tile in this app — a figure
 * fetched separately from the rows under it can disagree with them, and cannot
 * be shown at all with no connection. This is here for a page that wants the
 * fine rate or the loan length, neither of which is derivable from the rows.
 */
export type LoanSummary = {
  /** Every borrowing on record. */
  loans?: number | null
  /** Out and not yet back. */
  out?: number | null
  overdue?: number | null
  fines_owing?: number | null
  /** The school's own two lending rules, which no row carries. */
  fine_per_day?: number | null
  loan_days?: number | null
}

/**
 * `/loanedbooks/stock/{bookId}` — read off bronze 2026-09-15:
 * `{book_id, title, copies, available, on_loan, label}`. `available` is the
 * number to trust, and it is `copies` minus `on_loan`; `label` is the
 * catalogue's own `isavailable` switch, which says whether the office lends the
 * title at all and not whether a copy is there.
 */
export type BookStock = {
  book_id?: number | null
  title?: string | null
  available?: number | null
  on_loan?: number | null
  label?: string | null
  copies?: number | null
}

/**
 * `POST /admins/books/{bookId}/lend` — the body alone; the copy being lent is
 * the path.
 *
 * Which is worth writing down, because it was wrong: this used to post
 * `{studentId, bookId, toreturn}` to `/loanedbooks`, the register's own
 * collection endpoint, which is where a loan is *read* from and not where one
 * is made. Lending hangs off the book in this API, as returning and paying a
 * fine hang off the loan.
 *
 * Both fields are required here rather than optional. The shape is known from
 * one example and nothing else, and whether the endpoint would fall back to
 * the school's own `Library.loanDays` with the date left out has never been
 * seen — the flow asks for a date and defaults it to a fortnight, so nothing
 * needs to find out by guessing. Still refused with 409 — and a reason — where
 * the student already has a book out, owes a fine, or no copy is on the shelf.
 */
export type LendBody = {
  student_id: number
  /** YYYY-MM-DD. */
  datetoreturn: string
}

/**
 * `POST /admins/books/{bookId}/return` — keyed on the book, as lending is, and
 * not on the loan. 409 where the copy is already back.
 *
 * `status` is the condition the book came back in, which is the one field the
 * desk is asked for. What else this endpoint takes has not been seen: the
 * shape published for the loan-keyed version allowed a `returned_on` backdate,
 * and whether this one does — or whether it wants the student named, which a
 * book id alone does not settle when two copies are out — is unverified.
 */
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
 * `/loanedbooks/student/{studentId}` — one student's borrowing history, with the
 * flag a client reads to disable the borrow button before the desk tries.
 * `may_borrow` is undefined where the answer did not carry it, and the desk
 * then simply asks the lend endpoint, which answers with its own reason.
 */
export type StudentLoanHistory = {
  may_borrow?: boolean
  loans: Loan[]
}
