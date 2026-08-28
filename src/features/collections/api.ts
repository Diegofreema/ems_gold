import { queryOptions } from '@tanstack/react-query'
import type { CollectionDef, Row } from './types'

/** The design shows its loading skeleton for about this long on a navigation. */
const LATENCY_MS = 420

/** Stand-in for `GET /<portal>/<collection>`. Replace the body with a fetch. */
async function fetchRows(definition: CollectionDef): Promise<Row[]> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS))
  return definition.rows
}

/** Keyed on the list path — unique across portals — plus any row scope. */
export const collectionQuery = (definition: CollectionDef) =>
  queryOptions({
    queryKey: ['collection', definition.path, definition.scope ?? ''],
    queryFn: () => fetchRows(definition),
  })
