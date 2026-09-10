import { libraryService } from '@/api/library/service'
import type { Loan } from '@/api/library/types'
import { heldRows } from '@/db/collection'
import { refLoans } from '@/db/collections/reference'
import { pageRows } from '@/features/collections/api'
import { localFirst } from '@/features/collections/local-first'
import { newestFirst } from '@/features/collections/order'
import type { CollectionDef } from '@/features/collections/types'
import { loanRow } from './loan-row'

/**
 * The Lending page is the borrowing register, off `GET /loanedbooks` — every
 * borrowing, newest first, with issue, return, fines and corrections all here.
 * The shelf itself is the Library page next door (`./books`), where titles are
 * added and edited.
 *
 * The endpoint is not known to page or search, so the register is one set on
 * the device, searched and paged here.
 */
const allLoans = (): Promise<Loan[]> => heldRows(refLoans)

/**
 * Newest first, which this register has to state now that it is read out of a
 * keyed collection — the endpoint's own order does not survive being stored,
 * and the desk reads the day's borrowings off the top.
 */
const borrowings = (loans: readonly Loan[]) =>
  newestFirst(loans, (loan) => loan.borrowed_on ?? loan.date_created ?? loan.dateadded).map(
    (loan) => loanRow(loan),
  )

const register = () => allLoans().then(borrowings)

const countLoans = (standing?: string) => async () => {
  const rows = await register()
  return standing ? rows.filter((row) => row.standing === standing).length : rows.length
}

export const library: CollectionDef = {
  id: 'library',
  // Its own page beside the Library: the shelf itself is `./books`.
  path: '/admin/lending',
  kicker: 'School',
  title: 'Lending',
  description:
    'Every borrowing on record — what is out, what is late and what is owed. Issue a book from here; open a loan to take it back or collect the fine.',
  action: 'Issue a book',
  searchHint: 'Search student, title or standing',
  footer: 'Every borrowing on record',
  emptyTitle: 'Nothing is out',
  emptyBody:
    'No book has been lent yet. Issue one with the button above — the loan appears here the moment it goes out.',
  noun: 'loan',
  nameKey: 'book',
  // Records arrive by lending, not by typing: returns and fines are flows on
  // the record, and the register itself cannot be added to or edited.
  readonly: true,
  counts: [
    { label: 'Borrowings', count: countLoans() },
    {
      label: 'Out now',
      count: async () =>
        (await register()).filter((row) => row.standing !== 'Returned').length,
    },
    { label: 'Overdue', count: countLoans('Overdue') },
  ],
  filters: [{ key: 'standing', label: 'Any standing', options: ['Out', 'Overdue', 'Returned'] }],
  columns: [
    { key: 'student', label: 'Student', cardRole: 'title' },
    { key: 'book', label: 'Book', cardRole: 'subtitle' },
    { key: 'due', label: 'Due back' },
    { key: 'standing', label: 'Standing', tag: true, cardRole: 'tag' },
    { key: 'fine', label: 'Fine', align: 'right' },
  ],
  detail: [
    { key: 'student', label: 'Student' },
    { key: 'book', label: 'Book' },
    { key: 'borrowed', label: 'Borrowed' },
    { key: 'due', label: 'Due back' },
    { key: 'standing', label: 'Standing' },
    { key: 'returned_on', label: 'Returned on' },
    { key: 'condition', label: 'Condition' },
    { key: 'fine', label: 'Fine' },
    { key: 'paid', label: 'Fine standing' },
    { key: 'penalty_today', label: 'Fine if returned today' },
  ],
  tabs: [],
  collection: localFirst({
    entities: refLoans,
    rows: borrowings,
    // Already worked out on the rows rather than sent to the endpoint.
    narrow: (rows, filters) =>
      filters.standing ? rows.filter((row) => row.standing === filters.standing) : rows,
  }),
  source: async (params) => {
    const rows = await register()
    const standing = params.filters.standing
    return pageRows(standing ? rows.filter((row) => row.standing === standing) : rows, params)
  },
  // `/loanedbooks/{id}` carries `penalty_if_returned_today`, which the list
  // does not — so the record is asked for on its own, and the register only
  // answers where the detail endpoint would not.
  record: async (recordId) => {
    const detail = await libraryService.loan(recordId).catch(() => null)
    if (detail?.id != null) return loanRow(detail)
    return (await register()).find((row) => row.id === String(recordId))
  },
}
