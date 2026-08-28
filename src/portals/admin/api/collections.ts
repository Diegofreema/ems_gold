import { queryOptions } from '@tanstack/react-query'
import { adminCollections, type AdminCollectionId } from '../collections'
import type { Row } from '../collections/types'

/** The design shows its loading skeleton for about this long on a navigation. */
const LATENCY_MS = 420

/** Stand-in for `GET /admin/<collection>`. Replace the body with a fetch. */
async function fetchRows(id: AdminCollectionId): Promise<Row[]> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS))
  return adminCollections[id].rows
}

export const collectionQuery = (id: AdminCollectionId) =>
  queryOptions({
    queryKey: ['admin', id],
    queryFn: () => fetchRows(id),
  })
