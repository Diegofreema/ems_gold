import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'

/** The design paginates every list at 8 rows. */
export const PAGE_SIZE = 8

/**
 * Search and page live in the URL so a filtered list is shareable and survives
 * a reload. Changing the search resets to page 1, as the design requires.
 */
export function useListQuery() {
  const [query, setQueryState] = useQueryState(
    'q',
    parseAsString.withDefault(''),
  )
  const [page, setPageState] = useQueryState('page', parseAsInteger.withDefault(1))

  return {
    query,
    page,
    setQuery: (value: string) => {
      void setQueryState(value || null)
      void setPageState(null)
    },
    setPage: (value: number) => void setPageState(value === 1 ? null : value),
  }
}

export type Paged<T> = {
  rows: T[]
  total: number
  from: number
  to: number
  isFirstPage: boolean
  isLastPage: boolean
}

/** Slices already-filtered rows for the current page. */
export function paginate<T>(rows: T[], page: number): Paged<T> {
  const start = (page - 1) * PAGE_SIZE
  const pageRows = rows.slice(start, start + PAGE_SIZE)

  return {
    rows: pageRows,
    total: rows.length,
    from: rows.length ? start + 1 : 0,
    to: Math.min(start + PAGE_SIZE, rows.length),
    isFirstPage: page <= 1,
    isLastPage: start + PAGE_SIZE >= rows.length,
  }
}
