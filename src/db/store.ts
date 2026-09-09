import { persistedCollectionOptions } from '@tanstack/browser-db-sqlite-persistence'
import { createCollection, localStorageCollectionOptions, type Collection } from '@tanstack/react-db'
import type { OutboxOp } from './outbox'
import { runtime } from './runtime'
import { resetSnapshots, snapshotsReady } from './snapshot'

/**
 * A temp id and the id the school gave it.
 *
 * Kept as its own persisted set rather than on the op, because the op that
 * *created* a record and the ops that *reference* it are different rows, and
 * the reference has to be resolvable long after the creating op has gone.
 */
export type IdPair = {
  /** `local:<uuid>` */
  id: string
  real: string | number
  at: number
}

/**
 * The two sets that hold unsent work, on whatever storage this device gives us.
 *
 * OPFS when we have it. `localStorage` when we do not — these are small (an op
 * is a request body, not a register) and a browser that refuses OPFS will
 * usually still take a few kilobytes. Both are local-only collections, so a
 * plain `insert`/`update`/`delete` writes straight through and confirms
 * itself; there is no server behind either of them to wait for.
 */
function localCollection<T extends object>(
  id: string,
  storageKey: string,
  getKey: (item: T) => string,
  schemaVersion: number,
): Collection<T, string, never> {
  if (runtime.persistence) {
    return createCollection(
      persistedCollectionOptions<T, string>({
        id,
        getKey,
        persistence: runtime.persistence,
        schemaVersion,
      }),
    ) as Collection<T, string, never>
  }

  return createCollection(
    localStorageCollectionOptions<T, string>({ id, storageKey, getKey }),
  ) as unknown as Collection<T, string, never>
}

let ready = false
let outboxRef: Collection<OutboxOp, string, never> | null = null
let idMapRef: Collection<IdPair, string, never> | null = null

/** Every write this device has accepted and the school has not. */
export function outbox(): Collection<OutboxOp, string, never> {
  outboxRef ??= localCollection<OutboxOp>('outbox', 'netpro.outbox', (op) => op.id, 1)
  return outboxRef
}

/** What the school called the rows this device named first. */
export function idMap(): Collection<IdPair, string, never> {
  idMapRef ??= localCollection<IdPair>('id-map', 'netpro.id-map', (pair) => pair.id, 1)
  return idMapRef
}

/** The temp-to-real lookup, as `substitute` and `unresolved` want it. */
export function resolvedIds(): ReadonlyMap<string, string | number> {
  return new Map(idMap().toArray.map((pair) => [pair.id, pair.real]))
}

/**
 * Waits for both to finish reading themselves back off the disk.
 *
 * **Nothing may read the queue synchronously before this resolves.** A
 * persisted collection hydrates asynchronously, and until it has, `toArray` is
 * an empty list that is indistinguishable from an empty queue — so a drain
 * started too early finds nothing to send and stops, and an `enqueue` numbers
 * its op `1` again on top of work that is already numbered. The first loses
 * somebody's register; the second reorders it. Both are silent.
 *
 * So the boot path awaits this before React mounts, and so does a sign-in.
 */
export async function storeReady(): Promise<void> {
  await Promise.all([outbox().toArrayWhenReady(), idMap().toArrayWhenReady(), snapshotsReady()])
  ready = true
}

/** Whether the queue can be trusted to answer for itself. */
export const isStoreReady = () => ready

/**
 * Drops both, and forgets them, so the next read builds them against whatever
 * storage the next account gets.
 */
export function resetStore(): void {
  outboxRef = null
  idMapRef = null
  ready = false
  resetSnapshots()
}
