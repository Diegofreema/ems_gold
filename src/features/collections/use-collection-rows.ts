import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useListQuery } from '@/hooks/use-list-query'
import { collectionQuery } from './api'
import type { CollectionDef } from './types'

/**
 * One page of a collection, narrowed by the search box and the filters. Both
 * the paging and the narrowing happen wherever the rows come from — the server
 * for a live collection, `api.ts` for a fixture one — so this only reads the
 * answer.
 */
export function useCollectionRows(definition: CollectionDef) {
  const keys = useMemo(
    () => definition.filters?.map((filter) => filter.key) ?? [],
    [definition.filters],
  )
  const list = useListQuery(keys)
  const { query, filters } = list
  const { data } = useSuspenseQuery(
    collectionQuery(definition, { page: list.page, q: query, filters }),
  )
  const { pagination } = data

  // The count beside the search reads "matches of all", and only an unnarrowed
  // answer knows what "all" is — so the last one is kept while a search or a
  // filter cuts the list down. A link straight into a narrowed list has never
  // seen one, and stays undefined rather than passing the matches off as the
  // whole register. Adjusting state during render, as React documents.
  const narrowed = Boolean(query) || Object.values(filters).some(Boolean)
  const [all, setAll] = useState<number | undefined>(
    narrowed ? undefined : pagination.total,
  )
  if (!narrowed && all !== pagination.total) setAll(pagination.total)

  const start = (pagination.page - 1) * pagination.limit

  return {
    text: list.text,
    query,
    filters,
    page: list.page,
    setQuery: list.setQuery,
    setFilter: list.setFilter,
    setPage: list.setPage,
    total: all,
    paged: {
      rows: data.items,
      total: pagination.total,
      from: pagination.total ? start + 1 : 0,
      to: start + data.items.length,
      isFirstPage: pagination.page <= 1,
      isLastPage: pagination.page >= pagination.pages,
    },
  }
}
