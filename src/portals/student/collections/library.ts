import { pageRows } from '@/features/collections/api'
import type { CollectionDef } from '@/features/collections/types'
import { loanFine, loanPaid } from '@/features/library/loan-read'
import { formatNaira } from '@/lib/format'
import { queryClient } from '@/lib/query-client'
import { studentLoansQuery } from '../api/queries'
import { myLoanRow } from './my-loan-row'

/**
 * The pupil's own borrowings, off `GET /loanedbooks/mine`.
 *
 * Read-only twice over: the desk lends and takes back, and a pupil's page has
 * no business offering either. The fines tile is here because it is the one
 * figure a pupil is asked about at the desk.
 */

const myLoans = () =>
  queryClient
    .ensureQueryData(studentLoansQuery)
    .then((loans) => loans.map((loan) => myLoanRow(loan)))

/** What is owed across every borrowing, for the tile. */
const finesOwing = async () => {
  const loans = await queryClient.ensureQueryData(studentLoansQuery)
  return loans
    .filter((loan) => loanPaid(loan) === 'Owing')
    .reduce((sum, loan) => sum + loanFine(loan), 0)
}

export const library: CollectionDef = {
  id: 'library',
  path: '/student/library',
  kicker: 'Learning',
  title: 'My books',
  description:
    'Every book the library has lent you, with when each is due back. A book kept past its date gathers a fine by the day, so the date is the one to watch.',
  // No button: books are issued and taken back at the library desk.
  action: 'My books',
  readonly: true,
  searchHint: 'Search title or standing',
  footer: 'Your borrowing record, newest first',
  emptyTitle: 'No books out',
  emptyBody:
    'When the library issues a book to you at the desk, it appears here with the date it is due back. Nothing is borrowed from this page — ask at the library.',
  noun: 'loan',
  nameKey: 'book',
  counts: [
    {
      label: 'Out now',
      count: async () =>
        (await myLoans()).filter((row) => row.standing !== 'Returned').length,
    },
    {
      label: 'Overdue',
      count: async () =>
        (await myLoans()).filter((row) => row.standing === 'Overdue').length,
    },
    { label: 'Fines owing', count: finesOwing, format: formatNaira },
  ],
  tabs: [],
  columns: [
    { key: 'book', label: 'Book', cardRole: 'title' },
    { key: 'borrowed', label: 'Borrowed', cardRole: 'subtitle' },
    { key: 'due', label: 'Due back' },
    { key: 'standing', label: 'Standing', tag: true, cardRole: 'tag' },
    { key: 'fine', label: 'Fine', align: 'right' },
  ],
  detail: [
    { key: 'book', label: 'Book' },
    { key: 'borrowed', label: 'Borrowed' },
    { key: 'due', label: 'Due back' },
    { key: 'standing', label: 'Standing' },
    { key: 'returned_on', label: 'Returned on' },
    { key: 'condition', label: 'Condition' },
    { key: 'fine', label: 'Fine' },
    { key: 'paid', label: 'Fine standing' },
  ],
  source: (params) => myLoans().then((rows) => pageRows(rows, params)),
  record: (recordId) => myLoans().then((rows) => rows.find((row) => row.id === recordId)),
}
