import type { Collection } from '@tanstack/react-db'
import type { Row } from './types.ts'

/**
 * A collection with its row type forgotten.
 *
 * `CollectionDef` is passed along by every registry, route and component in the
 * portals, and giving it a type parameter would spread one to all of them for
 * the sake of a field most definitions do not have. So the binding is opaque
 * here and typed at the one place it is built — `localFirst` below, which is
 * the only cast in the bridge.
 */
type OpaqueCollection = Collection<Record<string, unknown>, string | number, never>


/**
 * Where a register's rows come from when they come from the device.
 *
 * A definition carrying one of these is read with a live query over the
 * collection rather than a request, so it draws on a device with no connection
 * and redraws by itself when a sync — or a write coming off the outbox —
 * changes what is stored.
 */
export type LocalFirstBinding = {
  /** The set behind the register. */
  entities: OpaqueCollection
  /**
   * A second set the rows need in order to name something on the first — a
   * topic holds a subject id and only the subject list can put a name to it.
   *
   * Two named slots rather than a list of them because the number of hooks a
   * render makes cannot vary, and the bridge spends one live query per slot.
   * A third join wants a `createLiveQueryCollection` of its own rather than a
   * third slot.
   */
  lookup?: OpaqueCollection
  /**
   * Everything the register shows, in the order it shows it.
   *
   * The ordering is not optional and is never inherited. A collection is keyed,
   * and hands its rows back in key order whatever order the endpoint sent them
   * in — measured, not assumed — so a register whose footer says "Newest first"
   * has to say so again here or it quietly stops being true.
   *
   * Searching and paging are not done here: `pageRows` does both afterwards,
   * exactly as it does for a register read from the API, so a bound definition
   * and an unbound one hand the page the same shape.
   */
  rows: (entities: readonly unknown[], lookup: readonly unknown[]) => Row[]
}

/**
 * Binds a definition to a collection, checking it against the real row type.
 *
 * The definition stores the opaque result; everything the caller writes is
 * type-checked here against what the collection actually holds.
 */
export function localFirst<
  T extends object,
  K extends string | number,
  L extends object = never,
  LK extends string | number = string | number,
>(spec: {
  entities: Collection<T, K, never>
  lookup?: Collection<L, LK, never>
  rows: (entities: T[], lookup: L[]) => Row[]
}): LocalFirstBinding {
  // A collection is invariant in the type it holds and in the type it keys by,
  // so the key is a parameter here rather than the `string | number` the
  // opaque form uses — otherwise a collection keyed by number, which is every
  // one of ours, would not be accepted at all.
  return {
    entities: spec.entities as unknown as OpaqueCollection,
    lookup: spec.lookup as unknown as OpaqueCollection | undefined,
    rows: (entities, lookup) => spec.rows(entities as T[], lookup as L[]),
  }
}
