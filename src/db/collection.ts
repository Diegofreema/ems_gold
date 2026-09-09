import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { createCollection, type Collection } from '@tanstack/react-db'
import { queryClient } from '@/lib/query-client'
import { classify } from './classify'
import { OfflineError, ShapeError } from './errors'
import { readSnapshot, writeSnapshot } from './snapshot'

export type SchoolCollectionSpec<T extends object, K extends string | number> = {
  /**
   * Stable for the life of the collection. It names the SQLite table and the
   * query key, so renaming it orphans everything already on somebody's device.
   */
  id: string
  /**
   * The existing service function from `src/api/<domain>/service.ts`.
   *
   * Nothing here re-implements a request. `src/api/client.ts` stays the only
   * place this app calls `fetch`, so the envelope unwrapping, the field errors
   * and the server clock all keep working exactly as they do everywhere else.
   */
  fetch: (signal?: AbortSignal) => Promise<T[]>
  getKey: (item: T) => K
  /** Bump when the row shape changes; the old table is discarded. */
  schemaVersion: number
  /**
   * Sync as soon as this module is imported, rather than when a screen asks.
   *
   * Off by default, and it matters: a collection is a module constant, so
   * eager sync means a signed-out visitor on the landing page fires the
   * parent portal's three requests — and a teacher pays for the admin
   * portal's. The route loader's `preload()` and any live query both start it,
   * which is every place it is genuinely wanted.
   */
  startSync?: boolean
  /** Only for genuinely volatile sets. Most school data is not. */
  refetchInterval?: number
}

/** Every collection built here, so a sign-out can tear all of them down. */
const built = new Map<string, Collection<never, never, never>>()

/** How to ask each one for the school's version again. */
const refetchers = new Map<string, () => Promise<unknown>>()

/** Why each one last refused, for a screen that has nothing else to show. */
const lastErrors = new Map<string, () => unknown>()

/**
 * What the school last said when this set could not be synced.
 *
 * Read rather than subscribed to: a live query over the collection already
 * re-renders when it goes into `error`, and this is what the render then puts
 * on screen. Undefined once a sync succeeds.
 */
export const collectionError = (id: string): unknown => lastErrors.get(id)?.()

export const allCollections = () => [...built.values()]

export const collectionById = (id: string) => built.get(id)

/** Refetches one collection by id, if this build has it. */
export async function refetchCollection(id: string): Promise<void> {
  await refetchers.get(id)?.()
}

/**
 * Asks the school again for every set on the device.
 *
 * The local-first counterpart to `dropDerivedReads`: an invalidation moves a
 * react-query cache, and a collection is not in one, so a write that changes
 * money or records has to reach these too or the reader sits looking at rows
 * the school no longer agrees with.
 *
 * Failures are swallowed on purpose. This is a refresh, and a device that
 * cannot reach the school keeps what it has — which is the whole point.
 */
export async function resyncCollections(ids?: readonly string[]): Promise<void> {
  const wanted = ids ?? [...refetchers.keys()]
  await Promise.all(
    wanted.map((id) => Promise.resolve(refetchers.get(id)?.()).catch(() => undefined)),
  )
}

/**
 * The one way to put a school endpoint on the device.
 *
 * Everything reachable offline goes through here, which is what makes the rule
 * in CLAUDE.md enforceable rather than aspirational: there is no second way to
 * build one, so a new endpoint either follows this shape or is visibly not
 * local-first.
 */
export function schoolCollection<T extends object, K extends string | number>(
  spec: SchoolCollectionSpec<T, K>,
) {
  const queryFn = async ({ signal }: { signal: AbortSignal }): Promise<T[]> => {
    if (!navigator.onLine) return kept()

    try {
      const rows = await spec.fetch(signal)

      // This answer is about to become the complete state of the collection,
      // so anything that is not a list of rows must stop here. A malformed
      // response read as "no rows" would empty this school's copy of the
      // register, and it would look like the register was empty.
      if (!Array.isArray(rows)) throw new ShapeError(spec.id)

      writeSnapshot(spec.id, rows)
      return rows
    } catch (error) {
      // Anything the school could not answer — a dropped connection, a 500, a
      // refused token — falls back to what it last said. A refusal still ends
      // the session, but through `/users/me` and the portal guard, which is
      // where that decision belongs; it must not also make the records already
      // on this device unreadable.
      const held = readSnapshot<T>(spec.id)
      if (held && held.length > 0) return held
      throw error
    }
  }

  /**
   * What to answer when there is no connection to ask over.
   *
   * Returning the snapshot rather than refusing is the whole mechanism: to the
   * collection this is an ordinary successful sync, so it goes `ready` with
   * every row on it and the live queries above it simply work. Refusing would
   * put it into `error` — where, as `snapshot.ts` records, it stays.
   */
  const kept = (): T[] => {
    const held = readSnapshot<T>(spec.id)
    if (held) return held
    // Never synced on this device, and no connection to sync it now.
    throw new OfflineError(spec.id)
  }

  const options = queryCollectionOptions<T, unknown, string[], K>({
    // Named rather than generated, so the collection a screen holds can be
    // traced back to its snapshot, its refetcher and its last error by the one
    // id — `use-collection-rows.ts` reads exactly that off the binding.
    id: spec.id,
    queryKey: ['db', spec.id],
    queryFn,
    queryClient,
    getKey: spec.getKey,
    startSync: spec.startSync ?? false,
    refetchInterval: spec.refetchInterval,
    staleTime: 30_000,
    // Reconnecting is the natural moment to find out what changed while the
    // device was away.
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    /**
     * Deliberately `always`, not `online`.
     *
     * Under `online` react-query pauses the request without running the
     * fetcher, so the collection is never told the attempt settled and sits in
     * `loading` for as long as the device is offline — which strands a route
     * loader waiting on `preload()`. Running the fetcher and letting it decide
     * (see the first line of `queryFn`) keeps that judgement in one place.
     */
    networkMode: 'always',
    retry: (failureCount: number, error: unknown) =>
      classify(error) === 'retryable' && failureCount < 2,
  })

  const collection = createCollection(options) as unknown as Collection<T, K, never>

  built.set(spec.id, collection as unknown as Collection<never, never, never>)
  // Kept beside the collection rather than reached through it: the registry is
  // keyed by string for the drain, and a collection read back out of a map of
  // mixed row types has no usable `utils` type left.
  refetchers.set(spec.id, () => options.utils.refetch())
  lastErrors.set(spec.id, () => options.utils.lastError)

  return collection
}
