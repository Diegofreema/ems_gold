# NETPRO EMS

A school portal for four kinds of people — the office, teachers, pupils and guardians — running in
Nigerian schools where the connection is intermittent or absent.

React 19 · TypeScript · Vite · TanStack Router · TanStack Query · TanStack DB · Tailwind 4 · zustand ·
nuqs · react-hook-form + zod. `@/` is `src/`. Package manager is **pnpm**.

```bash
pnpm dev        # vite
pnpm typecheck  # tsc -b --noEmit
pnpm lint       # oxlint
pnpm test       # node --test over src/**/*.test.ts, TZ=Africa/Lagos
pnpm build      # tsc -b && vite build
```

---

## Local-first is the default, not an option

Every read is served from the device and every write is accepted on the device, then reconciled with
the school's server afterwards. This is not a performance choice — it is what the app is for. A
teacher taking a register in a classroom with no signal must not lose the register, and a guardian in
a village must be able to open the portal and see their children.

**Any new endpoint consumed follows this same design.** A new read means a new collection in
`src/db/collections/`; a new write means a new handler registered in `src/db/registry.ts`. A plain
`useQuery` or `useMutation` added to `src/api/*/hooks.ts` is a temporary exception and must be
justified in its own comment.

### Reads

Server data lives in a TanStack DB collection built by `schoolCollection()` in
`src/db/collection.ts`. That is the only way to make one, so a set that is not local-first is
visibly not one.

- **A collection's fetcher must never resolve with `[]` or a partial page on failure.** The result
  is the complete state of the collection, so an empty answer deletes the school's copy of the
  register and looks like an empty school. On any failure the fetcher hands back the last thing the
  school said (`src/db/snapshot.ts`), and only refuses when the device has never synced that set.
- **A fetcher must always be able to finish.** Never call `queryClient.query` inside one: it carries
  the app's default network mode, so with no connection it pauses rather than fails, never settles,
  and strands the route loader waiting on `preload()`. Read another set's snapshot, or call the
  service directly.
- Collections sync lazily. A route loader's `preload()` or a live query starts it; importing the
  module does not, or a signed-out visitor on the landing page would fire the parent portal's
  requests.
- `preload()` in a route loader is the documented integration point. **Never call `preload()` or
  `loadSubset()` from a mutation handler or the outbox drain** — it deadlocks.

Reads are **not** persisted by `persistedCollectionOptions`. That was tried and measured: with rows
already on disk and the fetch failing, the collection settles into `status: 'error'` with `toArray`
empty and stays there, and `toArrayWhenReady()` rejects — the rows are on the disk and unreachable,
which is the one moment they are wanted. So the durable copy is ours (`src/db/snapshot.ts`) and the
persistence package is used for the local-only collections — outbox, id map, snapshots — where it
hydrates exactly as documented.

### Writes

Every mutation is applied locally at once and enqueued in the durable outbox (`src/db/outbox.ts`).

- The handler is registered **by name** in `src/db/registry.ts`. A queued write outlives the module
  that made it — marked on Tuesday, sent on Wednesday — so it cannot hold a closure.
- **Never rely on TanStack DB's automatic rollback for a write that might be made offline.** It
  rolls back when the handler throws and never retries, so a network failure would destroy the
  user's work. Collections carry no `onInsert`/`onUpdate`/`onDelete`; the queue owns the write path.
- **Nothing may read the queue before `storeReady()` resolves.** A persisted collection hydrates
  asynchronously, and until it has, `toArray` is an empty list indistinguishable from an empty
  queue — a drain started early finds nothing and stops, and an `enqueue` numbers its op `1` on top
  of work already numbered. The first loses a register; the second reorders one. Both are silent.
- Ops send strictly in `seq` order across every collection. A retryable failure blocks the head; a
  terminal one fails that op and cascades to whatever depended on it.
- 401/403 pauses the whole drain and burns no attempts. An expired token must not turn thirty saved
  attendance marks into thirty permanent failures.

### What is deliberately not local-first

The audit log (`src/api/logs`) is append-only and server-owned. Analytics are server aggregates. The
invoice ledger scan in `src/portals/admin/api/dashboard.ts` reads 6×1000 rows for a total the API
will not compute. These stay on the query path.

### Accepted trade-offs, written down so nobody rediscovers them as bugs

- **Server wins on refetch**, and a queued edit is last-write-wins against a row the school has since
  changed.
- **Offline start runs on the cached identity** for at most the token's own twelve hours —
  `src/api/token.ts` already drops an expired one, which is the ceiling. A token revoked server-side
  but not yet expired buys read access to data already on that device until it expires.
- **A row that has not synced is read-only** until it does, which is what lets the queue avoid
  chained edits on records the school has never seen.
- **Signing out wipes the device's database**, including the SQLite write-ahead log and the VFS page
  pool — a `.sqlite` deleted on its own leaves rows in `-wal`. School machines are shared.
- **The first visit runs from the network.** wa-sqlite is ~500 KB gzipped, so `bootstrapDb()` gives
  up after 1.5s and the session runs in memory; the service worker keeps it and every later visit is
  durable.

---

## The rest of the app

- **`src/api/client.ts` is the only place this app calls `fetch`.** `request()` unwraps the
  `{success, message, data}` envelope and throws `ApiError(status, message, errors)`. Every response
  re-anchors the school's clock through `noteServerTime`. Collections and the outbox both go through
  the existing `src/api/<domain>/service.ts` functions rather than re-implementing requests.
- **Toasts are declarative.** A mutation says `meta: { success }` and the mutation cache in
  `src/lib/query-client.ts` raises it; `ownsError` suppresses the error toast where the screen shows
  its own. The outbox raises the same sentence, adding "saved on this device" only when the write
  actually had to wait.
- **`Register` is augmented on `@tanstack/query-core`, not `@tanstack/react-query`.**
  `@tanstack/query-db-collection` augments it at its own home to add `queryMeta`, and once it does,
  an augmentation aimed at the re-exporting module is silently dropped — every `meta.success` goes
  back to `unknown`.
- **Every write drops the derived reads.** `dropDerivedReads` invalidates registers, records,
  pickers and dashboards from one place. Collection sources on the query path must read with
  `queryClient.query`, never `ensureQueryData`. Writes that move money also call `dropMoneyReads`,
  which resyncs the device's collections too — an invalidation does not reach one.
- **A shell route must never throw.** Its error boundary replaces the shell, and a missing pending
  component blanks the page. Portal route loaders start their work and swallow the failure.
- **`src/index.css` is the only source of design truth** — the hybrid token system, soft raised
  surfaces, and danger and success as the only colours beside brand.
- **Tests are `node --test` on pure logic.** A module under test uses relative imports with explicit
  `.ts` extensions, and no parameter properties (`erasableSyntaxOnly`). Anything risky in the local-
  first layer — failure classification, queue ordering, backoff, id substitution, the household
  composition, the banner's copy — is written as a pure function with a `.test.ts` sibling.
