import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { PAGE_SIZE } from '@/hooks/use-list-query'
import type { CollectionDef, ListParams, ListResult, Row } from './types'

/** The design shows its loading skeleton for about this long on a navigation. */
const LATENCY_MS = 420

function matches(row: Row, needle: string) {
  return Object.entries(row).some(
    ([key, value]) => key !== 'id' && value.toLowerCase().includes(needle),
  )
}

/**
 * The rows written into the definition, searched and paged here so that a
 * fixture list and a live one hand back exactly the same shape.
 */
async function fixtureRows(
  definition: CollectionDef,
  { page, q }: ListParams,
): Promise<ListResult> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS))

  const needle = q.trim().toLowerCase()
  const all = definition.rows ?? []
  const found = needle ? all.filter((row) => matches(row, needle)) : all
  const start = (page - 1) * PAGE_SIZE

  return {
    items: found.slice(start, start + PAGE_SIZE),
    pagination: {
      page,
      limit: PAGE_SIZE,
      total: found.length,
      pages: Math.max(1, Math.ceil(found.length / PAGE_SIZE)),
    },
  }
}

/**
 * A list the API cannot answer for. The page still loads, pages and reports
 * itself empty, so its empty state can explain what is missing rather than the
 * route showing rows nobody counted.
 */
export const emptySource = async (): Promise<ListResult> => ({
  items: [],
  pagination: { page: 1, limit: PAGE_SIZE, total: 0, pages: 1 },
})

/** Keyed on the list path — unique across portals — plus any row scope. */
export const collectionQuery = (definition: CollectionDef, params: ListParams) =>
  queryOptions({
    queryKey: ['collection', definition.path, definition.scope ?? '', params],
    queryFn: () =>
      definition.source?.(params) ?? fixtureRows(definition, params),
    // Turning a page keeps the rows on screen rather than dropping the whole
    // list back to the skeleton for one request.
    placeholderData: keepPreviousData,
  })
