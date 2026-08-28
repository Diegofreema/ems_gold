import { adminCollections } from './index'
import type { CollectionDef } from './types'

export type Heading = { title: string; crumb: string }

/** Looks a collection up by its URL segment; undefined means 404. */
export function resolveCollection(id: string): CollectionDef | undefined {
  return (adminCollections as Record<string, CollectionDef>)[id]
}

export function loadCollection(id: string) {
  const definition = resolveCollection(id)
  if (!definition) return undefined
  return {
    definition,
    heading: {
      title: definition.action,
      crumb: `${definition.kicker} · ${definition.title}`,
    } satisfies Heading,
  }
}

export function loadRecord(collectionId: string, recordId: string) {
  const definition = resolveCollection(collectionId)
  const record = definition?.rows.find((row) => row.id === recordId)
  if (!definition || !record) return undefined
  return {
    definition,
    record,
    heading: {
      title: record[definition.nameKey],
      crumb: `${definition.kicker} · ${definition.title}`,
    } satisfies Heading,
  }
}

export function loadRecordForEdit(collectionId: string, recordId: string) {
  const loaded = loadRecord(collectionId, recordId)
  if (!loaded) return undefined
  return {
    ...loaded,
    heading: {
      title: `Edit ${loaded.definition.noun}`,
      crumb: `${loaded.definition.kicker} · ${loaded.record[loaded.definition.nameKey]}`,
    } satisfies Heading,
  }
}
