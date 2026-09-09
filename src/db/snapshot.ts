import { persistedCollectionOptions } from '@tanstack/browser-db-sqlite-persistence'
import { createCollection, localStorageCollectionOptions, type Collection } from '@tanstack/react-db'
import { runtime } from './runtime'

/**
 * The last thing the school said about each set, kept on the device.
 *
 * ## Why this exists rather than `persistedCollectionOptions` doing it
 *
 * Wrapping a query collection in the SQLite persistence layer does persist its
 * rows, but it does **not** make them readable when the fetch fails — which is
 * the only moment they are wanted. Measured, on a real device: with rows
 * already on disk and the source throwing, the collection settles into
 * `status: 'error'` with `toArray` empty and stays there, and
 * `toArrayWhenReady()` rejects. The rows are on the disk and unreachable.
 *
 * That is the documented gap the TanStack DB skill flags — it describes what a
 * `queryFn` returning `[]` does and says nothing about one that rejects — and
 * the answer turns out to be hostile. So reads do not depend on it. The
 * snapshot below is written on every successful sync and handed back by the
 * fetcher whenever the school cannot be reached, which turns "offline" into an
 * ordinary successful answer as far as the collection is concerned.
 *
 * The persistence layer is still doing real work elsewhere: the outbox and the
 * id map are local-only persisted collections, and those hydrate exactly as
 * documented. It is specifically the sync-wrapped read path that does not.
 */
export type Snapshot = {
  /** The collection's id. */
  id: string
  rows: unknown[]
  at: number
}

let ref: Collection<Snapshot, string, never> | null = null

function collection(): Collection<Snapshot, string, never> {
  if (ref) return ref

  ref = (
    runtime.persistence
      ? (createCollection(
          persistedCollectionOptions<Snapshot, string>({
            id: 'snapshots',
            getKey: (snapshot) => snapshot.id,
            persistence: runtime.persistence,
            schemaVersion: 1,
          }),
        ) as unknown as Collection<Snapshot, string, never>)
      : (createCollection(
          localStorageCollectionOptions<Snapshot, string>({
            id: 'snapshots',
            storageKey: 'netpro.snapshots',
            getKey: (snapshot) => snapshot.id,
          }),
        ) as unknown as Collection<Snapshot, string, never>)
  )

  return ref
}

export async function snapshotsReady(): Promise<void> {
  await collection().toArrayWhenReady()
}

/** What the school last said about this set, if it ever said anything. */
export function readSnapshot<T>(id: string): T[] | undefined {
  const held = collection().get(id)
  return held ? (held.rows as T[]) : undefined
}

/**
 * Records the school's answer.
 *
 * Fire-and-forget: a device that cannot write its snapshot still has the rows
 * in memory for this session, and failing the fetch over it would trade a
 * working screen for a broken one.
 */
export function writeSnapshot(id: string, rows: unknown[]): void {
  try {
    const snapshot: Snapshot = { id, rows, at: Date.now() }
    if (collection().get(id)) {
      collection().update(id, (draft) => {
        draft.rows = rows
        draft.at = snapshot.at
      })
    } else {
      collection().insert(snapshot)
    }
  } catch (error) {
    console.warn('[db] could not keep a copy of', id, error)
  }
}

export function resetSnapshots(): void {
  ref = null
}
