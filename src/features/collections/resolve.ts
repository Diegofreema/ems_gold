import { ApiError } from '@/api/client'
import type { CollectionDef } from './types'

export type Heading = { title: string; crumb: string }

export type Registry = Record<string, CollectionDef>

/** Looks a collection up by its URL segment; undefined means 404. */
export function loadCollection(registry: Registry, id: string) {
  const definition = registry[id]
  if (!definition) return undefined
  return {
    definition,
    heading: {
      title: definition.action,
      crumb: `${definition.kicker} · ${definition.title}`,
    } satisfies Heading,
  }
}

/**
 * One record, by URL. A live collection is asked for it directly — the row may
 * be on a page this browser never loaded, so there is nothing local to search.
 */
export async function loadRecord(registry: Registry, id: string, recordId: string) {
  const definition = registry[id]
  if (!definition) return undefined

  const record = definition.record
    // A record the API does not have is a 404, not a failure — anything else
    // that went wrong is left to throw and reach the error boundary.
    ? await definition.record(recordId).catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 404) return undefined
        throw error
      })
    : definition.rows?.find((row) => row.id === recordId)
  if (!record) return undefined
  return {
    definition,
    record,
    heading: {
      title: record[definition.nameKey],
      crumb: `${definition.kicker} · ${definition.title}`,
    } satisfies Heading,
  }
}

export async function loadRecordForEdit(
  registry: Registry,
  id: string,
  recordId: string,
) {
  const loaded = await loadRecord(registry, id, recordId)
  // Reachable by URL even where no button offers it, so the guard lives here
  // rather than only on the page that draws the pencil.
  if (!loaded || loaded.definition.readonly) return undefined
  return {
    ...loaded,
    heading: {
      title: `Edit ${loaded.definition.noun}`,
      crumb: `${loaded.definition.kicker} · ${loaded.record[loaded.definition.nameKey]}`,
    } satisfies Heading,
  }
}
