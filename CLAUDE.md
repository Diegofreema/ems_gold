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
- Collections sync lazily, and **an explicit `preload()` is the only thing relied on to start
  them**. Importing the module does not, or a signed-out visitor on the landing page would fire the
  parent portal's requests. Whether a live query alone starts one has been claimed both ways — the
  library's docs say it does, an afternoon's measurement here said it did not — so nothing bets a
  register on it: every portal shell preloads its own sets fire-and-forget, the assignment routes
  preload theirs, and `useCollectionRows` preloads whatever sets a binding reads.
- `preload()` in a route loader is the documented integration point, and `heldRows()` in
  `src/db/collection.ts` is how everything that is not a live query reads a set — a count tile, a
  record lookup, a form's dropdown. **Never call `preload()` or `loadSubset()` from a mutation
  handler or the outbox drain** — it deadlocks.
- **A register bound to a collection must state its own order.** A collection is keyed and hands its
  rows back in key order whatever order the endpoint sent them in — measured, and it silently
  inverted the two registers whose footers promise "Newest first". Ordering lives in the binding;
  see `src/features/collections/order.ts`.
- A register reads a collection through `collection:` on its `CollectionDef` — a `localFirst(...)`
  binding, built in `src/features/collections/local-first.ts`. Searching and paging still happen in
  `pageRows`, so a bound register and an unbound one hand the page the same shape and nothing in
  `collection-list.tsx`, the data table or the pagination changes. Not yet compatible with `filters`.
  Ordering lives in `src/features/collections/order.ts`.
- **An endpoint that answers with a document is kept whole**, through `schoolDocument()`. A pupil's
  fee ledger is the bills *and* the payments taken against them; the timetable is the grid *and* the
  class it was drawn for; the mark catalogue is the words *and* which of them mean the child was in
  school. The list is one field of the answer, and storing the field alone throws away what the
  panel beside it reads. `heldDocument()` reads one back, `useHeldDocument()` in `src/db/live.ts`
  watches one from a component.
- **A page reads a set with `useHeld`/`useHeldDocument`, never `useSuspenseQuery`.** There is
  nothing to suspend on once the reading is local, and a paused request never settles. `pending` is
  true only before a set has answered *either way*: a set that refused is not pending, it is a set
  this device has never synced and cannot sync now, which is a thing to say rather than spin on.

- **Every summary tile is counted on its own** (`Promise.allSettled`), and the strip runs with
  `networkMode: 'always'`. One figure that cannot be worked out used to take the whole strip with
  it — a register counted off the device sat beside a single tile that still asks the school, and
  with no connection all three went blank. A tile that cannot answer reads as a dash.
- **A count tile counts the set, not the endpoint** — `heldRows(...).length` rather than a
  `pagination.total` off a `limit: 1` request. A figure above a register that is fetched separately
  from the rows below it can disagree with them, and cannot be read at all with no connection.
- **A summary tile's figure is animated on mount.** `CountUp` tweens from zero over ~900ms, longer
  with the motion setting up, so a screenshot taken mid-tween shows a number that is neither the old
  value nor the new one. Read the settled figure — or the data behind it — before concluding a count
  is wrong; an afternoon has already gone that way, and the "fix" was reverting a correct change.

Reads are **not** persisted by `persistedCollectionOptions`. That was tried and measured: with rows
already on disk and the fetch failing, the collection settles into `status: 'error'` with `toArray`
empty and stays there, and `toArrayWhenReady()` rejects — the rows are on the disk and unreachable,
which is the one moment they are wanted. So the durable copy is ours (`src/db/snapshot.ts`) and the
persistence package is used for the local-only collections — outbox, id map, snapshots — where it
hydrates exactly as documented.

The school's own reference data — classes, arms, subjects, fees, sessions, terms, roles, the
catalogue, the staff and pupil directories — lives in `src/db/collections/reference.ts`, and every
`optionsFrom` feed in `option-feeds.ts` reads it. **That is what makes a form fillable with no
connection**, which is a bigger win than any one register: a page that lists something is useful to
read, but a page that cannot offer the school's own classes is a page nobody can fill in.

Two rules follow from it. A feed that used to ask the API for a **narrowed** answer now asks for the
whole set and narrows it here — a set narrowed at the fetch cannot be widened later without a second
request, and there may be no connection to make one over; that is why `class-arms/for-department/{id}`
became a filter on the arms set, and why the retired fees and withdrawn subjects are stored and
filtered rather than filtered away at the fetch. And the feeds' own react-query wrapper carries
`networkMode: 'always'` for the same reason the collections do: under `online` it pauses without
running the function, so a dependent feed the office had not already opened — an arm feed is keyed by
the class chosen — stayed on "Loading…" for as long as the device was offline.

The two **searched** feeds (`searchFrom`) still ask the school first: they exist for registers too
long to hold, and the endpoint searches the whole of one where this device holds the first couple of
hundred. A refusal falls back to searching what the device keeps, which is narrower than the school's
answer and honest about it.

### Writes

Every mutation is applied locally at once and enqueued in the durable outbox (`src/db/outbox.ts`).

- The handler is registered **by name** in `src/db/registry.ts`. A queued write outlives the module
  that made it — marked on Tuesday, sent on Wednesday — so it cannot hold a closure.
- **Never rely on TanStack DB's automatic rollback for a write that might be made offline.** It
  rolls back when the handler throws and never retries, so a network failure would destroy the
  user's work. Collections carry no `onInsert`/`onUpdate`/`onDelete`; the queue owns the write path.
- **A row action can go through the queue too** — `queueRun` on the spec instead of `run`, called
  straight rather than through a mutation for the same reason a queued save is. Worth giving only to
  a register that already reads off the device: a queued action on a register nobody can open with
  no connection is a button on a row nobody can see.
- **A queued change to an existing row is shown by the binding's `overlay`**, as a queued *new*
  record is shown by `queued`. Without it a queued row action reads as a button that did nothing —
  the op is safe on the device and the row still says what the school last said. The row shows what
  it is about to be; the banner and the drawer say it has not got there yet.
- **`enqueue` drops the derived reads itself.** A write accepted on the device makes what is derived
  from it stale *now*, not when the school eventually hears about it. A register on a live query
  follows the queue by itself; the figures above it are react-query and do not.
- **The guardrail covers row actions too**, not just edit and delete: making a session current is a
  school setting pointing at a row, and it cannot point at one the school has never issued. The row
  action's label is withheld for an unsynced row, so no button is offered at all.
- **A queued write is called straight from the form, never through a mutation.** It is accepted on
  the device and returns at once; wrapping that in a `useMutation` put the mutation cache, the
  router's loaders and react-hook-form's own submitting state in front of something synchronous, and
  the form sat with its button spinning over a write that was already safe. `definition.queue` and
  `definition.queueRemove` are called directly; the queue raises its own toast, so a queued
  definition takes no `meta`.
- **A form that cannot be queued says so before it is filled in**, not after
  (`src/features/collections/blocked.ts`). The two kinds that stay on the wire are there for a
  reason: a form carrying a file has no body the queue could hold, and a create that reads the
  school before writing — a pupil's enrolment asks which session is current — has nothing to read
  when there is no school to ask.
- **Nothing may read the queue before `storeReady()` resolves.** A persisted collection hydrates
  asynchronously, and until it has, `toArray` is an empty list indistinguishable from an empty
  queue — a drain started early finds nothing and stops, and an `enqueue` numbers its op `1` on top
  of work already numbered. The first loses a register; the second reorders one. Both are silent.
- Ops send strictly in `seq` order across every collection. A retryable failure blocks the head; a
  terminal one fails that op and cascades to whatever depended on it.
- 401/403 pauses the whole drain and burns no attempts. An expired token must not turn thirty saved
  attendance marks into thirty permanent failures.
- **Handlers are registered at boot, in `src/db/handlers/`, never by the portal that uses them.** A
  register marked on Tuesday afternoon is sent by whatever code is running on Wednesday morning, and
  a drain that ran before the teacher's bundle loaded would find the op naming a handler this build
  "no longer knows how to send" and put a good register in front of somebody to puzzle over. For the
  same reason a handler names its collection by id from `src/db/ids.ts` and never imports one:
  importing them there would build every portal's sets for every visitor, on the first load.
- **A screen shows queued work by reading the outbox, not by writing into the collection.** An
  optimistic `writeUpsert` is wiped by the next sync, which for a register is any refetch before the
  op lands; an overlay read from the queue exists exactly as long as the op does and disappears when
  the school's own answer replaces it. `day.ts` and `scores/queued.ts` are the two worked examples,
  both pure and both tested. Only ops still expected to land are drawn — a `failed` one would tell a
  teacher a child was marked when the school refused it, and that op belongs to the drawer.
- **A queued write's answer comes back to the drain, not to the page that made it.** Anything the
  endpoint says about what it did — which student ids it ignored — has nowhere else to go, so the
  handler declares a `note` and the drain raises it.

A register a teacher fills in is composed from three things, in this order: the roll, so there is a
sheet at all; what the school has already filed for that day, where the device holds it; and the
marks this teacher has made that the school has not heard. A day outside the window the device keeps
is drawn from the roll alone and **says so** — `POST /attendances/register` leaves a student out of
`marks` alone, so marking from a blank sheet cannot erase anybody, but a teacher is owed the
difference between "nobody marked this day" and "this device does not know who did".

### What is deliberately not local-first

The audit log (`src/api/logs`) is append-only and server-owned. Analytics are server aggregates. The
invoice ledger scan in `src/portals/admin/api/dashboard.ts` reads 6×1000 rows for a total the API
will not compute. Register coverage (`attendances/coverage`) is an audit of which registers were
never taken, over a range — a month of it is not what a teacher needs in a classroom, and there is
no endpoint that answers for a range anyway. These stay on the query path, and each says plainly
when it could not be reached rather than drawing zeroes: "every day has a register" is the one
wrong answer that page could give.

**One resource can be two sets, where the cheap read and the expensive one have different callers.**
Classes are the case in point: `refClasses` is the plain list every form's class dropdown offers,
and `refClassCensus` is the same classes each asked for its own detail, because the register shows
how many arms, students and subjects each holds and `GET /departments` sends the row alone. Folding
the second into the first would put an N+1 behind most of the forms in the app; keeping them apart
means the detail syncs only when somebody opens the classes register. Measured: one list request on
the arms page, none of the details.

**The directories are held whole, on a decision taken in the open**: these schools run to hundreds
of pupils, not thousands, so `A_SCHOOL` in `reference.ts` is the size the registers are fetched at
and the one place a change of scale shows up. A school in the thousands wants the pupil and
household registers paged at the endpoint again.

**A register whose filter *replaces* the population holds both and picks one.** The staff page is
teachers and office records — two endpoints — and its dropdown swaps between them rather than
narrowing. Both sets are on the device, the rows are told apart by the kind their own key carries,
and `narrow` picks the population; the pinned pages are the same binding with the choice made for
them. A swapping register reports **matches alone** and never a total, local or not: there is no
whole for it to be a part of. That register is also why a binding has three lookup slots — teachers,
the office records beside them, and the catalogue that names an office account's role, which
`GET /admins` sends as a bare `role_id`.

**A predicate that reads a row's key must use that key's own reader.** `byStaffKind` matched on a
prefix it had invented, and the test agreed with it because the fixtures used the invented format
too — so both passed and the page showed an administrator on the teaching register. The reader is
passed in now. A test written against a shape nobody produces proves nothing.

**Money is not queued.** The fee *catalogue* is — what the school charges, and whether it still
charges it — but raising an invoice against a fee and taking payment for one are not. A payment
accepted on a device and sent later is a receipt the bursary cannot reconcile, which is a different
decision from the ones this queue was built for.

Upload batches are not a set either, for a different reason: `GET /teachers/me/uploads` answers
`{"batches": []}` for every teaching login on this deployment, so which fields carry the four ids
that name a batch is exactly what nobody has seen — and a collection needs a key. Storing rows under
a key guessed from an unseen shape is how a register quietly holds two copies of the same row.

### Accepted trade-offs, written down so nobody rediscovers them as bugs

- **Server wins on refetch**, and a queued edit is last-write-wins against a row the school has since
  changed.
- **Offline start runs on the cached identity** for at most the token's own twelve hours —
  `src/api/token.ts` already drops an expired one, which is the ceiling. A token revoked server-side
  but not yet expired buys read access to data already on that device until it expires.
- **A row that has not synced is read-only** until it does — `src/features/collections/unsynced.ts`,
  recognised by its `local:` id. This is what lets the queue avoid chained edits on records the
  school has never seen: an edit would name an id that does not exist yet, so the queue would need a
  dependency graph, resolved at send time and unpicked when the create it depended on failed. One
  rule removes all of it. The edit route and the delete button are withheld, and both write hooks
  refuse such an id loudly in case something gets past them.
- **Two tabs share one queue, and only one of them sends.** The persistence coordinator
  (`BrowserCollectionCoordinator`, Web Locks + BroadcastChannel) elects one tab per collection so a
  single SQLite file has a single writer and the tabs see each other's rows. That says nothing about
  who is allowed to *send*, which is the dangerous half — a queued create is not idempotent — so the
  drain holds a Web Lock of its own (`one-tab.ts`) and a second tab that cannot get it simply does
  not drain. A browser with no Web Locks runs unguarded, which is the single-tab behaviour the app
  had before and no worse than it.
- **Two tabs enqueuing in the same instant can take the same `seq`.** They share the outbox, so each
  reads the other's rows, but the read and the write are not atomic across tabs. A tie is an
  unspecified order between two writes made at the same moment, which is genuinely ambiguous anyway
  — not lost work, and not a reordering of anything that depended on anything.
- **Signing out reaches every tab.** `announceSignOut` broadcasts and every other tab navigates to
  the sign-in page, because signing out of one used to leave the next tab showing a register of real
  pupils while the database was deleted underneath it. On a shared staff-room laptop that is the
  whole point of wiping at all.
- **Signing out wipes the device's database**, including the SQLite write-ahead log and the VFS page
  pool — a `.sqlite` deleted on its own leaves rows in `-wal`. School machines are shared.
- **The school's clock is anchored across reloads.** `src/lib/server-clock.ts` keeps the last
  offset in `localStorage`, so a pupil sitting an assignment on a laptop that is ten minutes fast
  keeps the correction through a reload with no signal — the one moment nothing can re-measure it.
  A stored anchor beyond two days is discarded: it would mean the device's own clock had been
  changed since, and a wrong correction is worse than none. It remains what it always was — not a
  security boundary.
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
  pickers and dashboards from one place, and resyncs the device's own sets alongside them — an
  invalidation reaches a query key, never a collection, so a teacher filing a topic would otherwise
  watch the register go on showing what it held. `src/db/collection.ts` registers that resync
  through `alsoDropOnWrite` rather than being imported, so the two modules do not need each other.
  A set nobody has opened is skipped: refetching an idle collection asks for it on the strength of a
  write to something else, and an admin saving a fee would fetch the teacher's own subjects and be
  refused. Collection sources on the query path must read with `queryClient.query`, never
  `ensureQueryData`. Writes that move money also call `dropMoneyReads`.
  The outbox drain drops them **once at the end of a pass**, not per op — thirty attendance marks
  are thirty ops, and thirty full resyncs would ask the school the same questions thirty times.
- **A shell route must never throw.** Its error boundary replaces the shell, and a missing pending
  component blanks the page. Portal route loaders start their work and swallow the failure.
- **`src/index.css` is the only source of design truth** — the hybrid token system, soft raised
  surfaces, and danger and success as the only colours beside brand.
- **Tests are `node --test` on pure logic.** A module under test uses relative imports with explicit
  `.ts` extensions, and no parameter properties (`erasableSyntaxOnly`). Anything risky in the local-
  first layer — failure classification, queue ordering, backoff, id substitution, the household
  composition, the banner's copy — is written as a pure function with a `.test.ts` sibling.
