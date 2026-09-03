import { libraryService } from '@/api/library/service'
import type { Loan } from '@/api/library/types'
import { pageRows } from '@/features/collections/api'
import type { CollectionDef } from '@/features/collections/types'
import { queryClient } from '@/lib/query-client'
import { loanRow } from './loan-row'

/**
 * The Lending page is the borrowing register, off `GET /loanedbooks` — every
 * borrowing, newest first, with issue, return, fines and corrections all here.
 * The shelf itself is the Library page next door (`./books`), where titles are
 * added and edited.
 *
 * The endpoint is not known to page or search, so the register is fetched
 * whole and searched here, under the `['library']` cache prefix. Read through
 * `queryClient.query` rather than `ensureQueryData`: the second returns what is
 * cached however stale it is, so a lending flow's invalidation would be handed
 * straight back the page it had just dropped.
 */
const allLoans = (): Promise<Loan[]> =>
  queryClient.query({
    queryKey: ['library', 'loans'],
    queryFn: () => libraryService.loans(),
  })

const register = () => allLoans().then((loans) => loans.map((loan) => loanRow(loan)))

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
  searchHint: 'Search pupil, title or standing',
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
