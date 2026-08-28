import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { paginate, useListQuery } from '@/hooks/use-list-query'
import { collectionQuery } from '../api/collections'
import type { AdminCollectionId } from '../collections'
import type { Row } from '../collections/types'

/** Fetches a collection, then filters it by the URL search and paginates it. */
export function useCollectionRows(id: AdminCollectionId) {
  const { query, page, setQuery, setPage } = useListQuery()
  const { data } = useSuspenseQuery(collectionQuery(id))

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
