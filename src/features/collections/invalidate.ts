import type { QueryClient } from '@tanstack/react-query'

/**
 * The keys the app reads *derived* data under — data built out of other
 * endpoints' answers rather than being one endpoint's answer. That is why a
 * write which carefully drops its own domain key still leaves these showing
 * what used to be true: no domain owns them.
 *
 * - `['collection', path, …]` — a register's rows and the count tiles above
 *   them, mapped from whatever the collection's `source` fetched.
 * - `['record-modal', id, …]` — the record itself. Most records are a dialog
 *   over their register now rather than a page, so they live in the query cache
 *   instead of a route loader. Editing from a modal and coming back to it was
 *   the worst of these: the form saved, the register updated underneath, and
 *   the record on top of both still read the values just replaced.
 * - `['detail-tab', …]` — the sub-tables on a record.
 * - `['options', …]` and `['search', …]` — the pickers other forms are built
 *   from. A class added here is a class the student form has to offer, and that
 *   feed holds its answer for five minutes.
 */
const DERIVED = [
  ['collection'],
  ['record-modal'],
  ['detail-tab'],
  ['options'],
  ['search'],
  // The three portals' dashboards. Each is an aggregate of four or five
  // endpoints under a key of its own, so every write in the app moves a figure
  // on one of them and no domain root reaches them.
  ['admin', 'dashboard'],
  ['teaching', 'dashboard'],
  ['my-schooling', 'dashboard'],
  ['parent', 'family'],
]

/**
 * Drops every derived read after a write, wherever the write happened.
 *
 * Called for **every** mutation in the app, from the mutation cache in
 * `lib/query-client` — because the alternative was asking each of forty-odd
 * write sites to remember which registers happen to be built out of the
 * endpoint it just wrote to, and most of them did not. A teacher writing the
 * first question of an assignment updates `['set-assignments']` correctly and
 * leaves the assignment register reading "No questions"; a mark entered on the
 * scores sheet leaves "Browse results" showing the old grade. Neither page
 * knows the other exists, and neither should have to.
 *
 * Only what is on screen actually refetches. Everything else is marked stale
 * and costs nothing until it is next looked at.
 *
 * A collection's rows are only as fresh as what its `source` fetched, so the
 * sources read through `queryClient.query` rather than `ensureQueryData` —
 * which returns whatever is cached however stale, invalidation and all, and
 * would hand this refetch the same rows straight back.
 */
export function dropDerivedReads(queryClient: QueryClient): Promise<unknown> {
  return Promise.all(
    DERIVED.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  )
}
