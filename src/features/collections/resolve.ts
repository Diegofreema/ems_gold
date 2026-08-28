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

export function loadRecord(registry: Registry, id: string, recordId: string) {
  const definition = registry[id]
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

export function loadRecordForEdit(
  registry: Registry,
  id: string,
  recordId: string,
) {
  const loaded = loadRecord(registry, id, recordId)
  if (!loaded) return undefined
  return {
    ...loaded,
    heading: {
      title: `Edit ${loaded.definition.noun}`,
      crumb: `${loaded.definition.kicker} · ${loaded.record[loaded.definition.nameKey]}`,
    } satisfies Heading,
  }
}
