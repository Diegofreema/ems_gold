import { libraryService } from '@/api/library/service'
import type { Book } from '@/api/library/types'
import { pageRows } from '@/features/collections/api'
import { BLANK } from '@/features/collections/blank'
import type { CollectionDef, Row } from '@/features/collections/types'
import { when } from '@/features/collections/when'
import { queryClient } from '@/lib/query-client'

/**
 * The shelf itself, off `GET /admins/books` — every title the school holds,
 * with the copies and whether it still lends. The borrowings against it are
 * the Lending page (`./loans`).
 *
 * The endpoint answers whole and ignores paging, so the catalogue is fetched
 * once and searched here. It shares the `['library']` cache prefix with the
 * register, which every lending and title flow drops after a write.
 */
const allBooks = (): Promise<Book[]> =>
  queryClient.ensureQueryData({
    queryKey: ['library', 'books'],
    queryFn: () => libraryService.books(),
  })

function text(value: string | number | null | undefined): string {
  const written = String(value ?? '').trim()
  return written || BLANK
}

function bookRow(book: Book): Row {
  return {
    id: String(book.id),
    title: book.title,
    author: text(book.author),
    section: text(book.section),
    copies: String(book.copies),
    lending: book.isavailable,

    // Read by the record panel and the edit flow, not by the table.
    isbn: text(book.isbn),
    pubdate: text(book.pubdate),
    callno: text(book.callno),
    added: when(book.date_created),
  }
}

const shelf = () => allBooks().then((found) => found.map((book) => bookRow(book)))

export const books: CollectionDef = {
  id: 'books',
  path: '/admin/library',
  // A handful of short fields and no sub-tables: the title opens over the shelf.
  modal: true,
  kicker: 'School',
  title: 'Library',
  description:
    'Every title the school holds — how many copies are on the shelf and whether it still lends. The borrowings against them are on the Lending page.',
  action: 'Add a title',
  searchHint: 'Search title, author or ISBN',
  footer: 'Every title on the shelf',
  emptyTitle: 'No books in the library',
  emptyBody:
    'Add the first title with the button above — it can be issued the moment it is in.',
  noun: 'title',
  nameKey: 'title',
  // Titles arrive and change by flow — Add a title, Edit a title — so the
  // rows themselves offer neither pencil nor bin.
  readonly: true,
  tabs: [],
  counts: [
    { label: 'Titles', count: async () => (await shelf()).length },
    {
      label: 'Copies held',
      count: async () =>
        (await allBooks()).reduce((sum, book) => sum + (Number(book.copies) || 0), 0),
    },
    {
      label: 'Available to lend',
      count: async () =>
        (await shelf()).filter((row) => row.lending === 'Available').length,
    },
  ],
  filters: [
    { key: 'lending', label: 'Any standing', options: ['Available', 'Unavailable'] },
  ],
  columns: [
    { key: 'title', label: 'Title', cardRole: 'title' },
    { key: 'author', label: 'Author', cardRole: 'subtitle' },
    { key: 'section', label: 'Section' },
    { key: 'copies', label: 'Copies', align: 'right' },
    { key: 'lending', label: 'Lending', tag: true, cardRole: 'tag' },
  ],
  detail: [
    { key: 'title', label: 'Title' },
    { key: 'author', label: 'Author' },
    { key: 'isbn', label: 'ISBN' },
    { key: 'pubdate', label: 'Published' },
    { key: 'section', label: 'Section' },
    { key: 'callno', label: 'Call number' },
    { key: 'copies', label: 'Copies held' },
    { key: 'lending', label: 'Lending' },
    { key: 'added', label: 'Added' },
  ],
  source: async (params) => {
    const rows = await shelf()
    const lending = params.filters.lending
    return pageRows(lending ? rows.filter((row) => row.lending === lending) : rows, params)
  },
  record: async (recordId) => (await shelf()).find((row) => row.id === recordId),
}
