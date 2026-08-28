import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { paginate, useListQuery } from '@/hooks/use-list-query'
import { collectionQuery } from './api'
import type { CollectionDef, Row } from './types'

/** Fetches a collection, then filters it by the URL search and paginates it. */
export function useCollectionRows(definition: CollectionDef) {
  const { query, page, setQuery, setPage } = useListQuery()
  const { data } = useSuspenseQuery(collectionQuery(definition))

  const matching = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return data
    return data.filter((row) =>
      Object.entries(row).some(
        ([key, value]) => key !== 'id' && value.toLowerCase().includes(needle),
      ),
    )
  }, [data, query])

  return {
    query,
    page,
    setQuery,
    setPage,
    total: data.length,
    paged: paginate<Row>(matching, page),
  }
}
