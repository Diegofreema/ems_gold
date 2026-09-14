# NETPRO EMS

A school portal for four kinds of people — the office, teachers, students and guardians — running in
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
- **An endpoint that answers with a document is kept whole**, through `schoolDocument()`. A student's
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
catalogue, the staff and student directories — lives in `src/db/collections/reference.ts`, and every
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

**The wire first, and the device when the wire is not there.** `enqueue` in `src/db/drain.ts` sends
the write to the school and waits for the answer; only a write that could not be sent goes into the
durable outbox (`src/db/outbox.ts`). It returns a `WriteOutcome` and never throws — `sent`, `held`,
or `refused` — and the screen that made the write reads it.

This is the way round it is for one reason: **a refusal belongs on the screen that caused it.** The
queue-first version accepted everything, so a save the school was never going to take became a row
on a register saying "Waiting to send", the form closed over the typing that caused it, and the
school's actual sentence went to a drawer the writer had no reason to open. Now a `refused` write
queues nothing, raises the school's own words, and leaves the form open with everything still in it
— and **every caller that clears what somebody typed must check for it first**: the register's
marks, a score sheet, a message, a question, the record forms. `grep` for `'refused'`.

What this costs, written down so nobody rediscovers it: between pressing Save and the school
answering, the write is in flight and nowhere durable, so a tab closed in that second loses it.
That was the queue-first design's one real advantage and it is genuinely gone. A poor connection is
not a special case — it is a slow send that ends in `held` when `request()`'s own 30s bound gives
up, and the writer waits that long before being told. Nothing races that bound: aborting a create
early and queueing it is how the same student gets enrolled twice.

Two things stay the queue's, in `mayGoStraight` (`src/db/straight.ts`, tested):
**nothing overtakes work already in line** — ops send strictly by `seq` because writes depend on
each other, so while anything is still expected to land, a new write joins the back of the queue
rather than jumping it — and **401 keeps the work**, pausing the drain and holding the write rather
than losing it. A `failed` op blocks nothing: it is waiting on a person, and letting it hold up
every write made after it would wedge the app on one refusal.

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
- **A write is called straight from the form, never through a mutation.** The mutation cache, the
  router's loaders and react-hook-form's own submitting state in front of one write was three
  machines too many. `definition.queue` and `definition.queueRemove` are called directly and
  awaited, and they hand back the `WriteOutcome`; the queue raises its own toast, so a queued
  definition takes no `meta`.
- **Nothing that lands is awaited by the writer.** The write is finished when the school answers.
  Refetching the set and dropping what the write made stale are this app catching up with a fact,
  and awaiting them held the record form open for a second full round trip after the save had
  already succeeded. They are fired and their failures swallowed: a set that could not be refetched
  is a stale list, not a lost record.
- **A form that cannot be queued says so before it is filled in**, not after
  (`src/features/collections/blocked.ts`). The two kinds that stay on the wire are there for a
  reason: a form carrying a file has no body the queue could hold, and a create that reads the
  school before writing — a student's enrolment asks which session is current — has nothing to read
  when there is no school to ask.
- **Nothing may read the queue before `storeReady()` resolves.** A persisted collection hydrates
  asynchronously, and until it has, `toArray` is an empty list indistinguishable from an empty
  queue — a drain started early finds nothing and stops, and an `enqueue` numbers its op `1` on top
  of work already numbered. The first loses a register; the second reorders one. Both are silent.
- Ops send strictly in `seq` order across every collection. A retryable failure blocks the head; a
  terminal one fails that op and cascades to whatever depended on it.
- **401 pauses the whole drain and burns no attempts; 403 does not.** An expired token must not turn
  thirty saved attendance marks into thirty permanent failures — but this API answers 401 for a
  token it will not take and keeps 403 for what this account may not do to *this row*: a class you
  do not teach, a child who is not yours, somebody not on your contacts list. Pausing on those wedged
  the queue for the rest of the session behind one write the school was never going to accept, with
  the banner still calling it "still being sent". A 403 fails its own op, with the school's sentence,
  and the queue carries on.
- **"Send now" means now.** The banner's button and the drawer's retry go through `sendNow()`, not
  `drain()`: a plain drain returns at the auth pause and skips a head that is serving out a backoff,
  which are exactly the states the button is shown in, so it did nothing in every one of them.
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
- **A create tells the drain where its new id is**, with `newId` on the handler — required of every
  non-idempotent write and refused of the rest, which is one line drawn twice: the write that makes
  a row is the write whose id the device could not know in advance. It reads the key the endpoint
  nests the record under (`{student}`, `{sparent}`, `{class_arm}`, `{semester}` — `new-id.ts`),
  never `answer.id`, which is the shape **no** create on this API answers in: the old reader guessed
  it, found nothing, and so every queued create in the app's history landed at the school and
  recorded no id at all — silently, because nothing yet passes `dependsOn` and so nothing had asked.
  Nor can the wrapper be unwrapped by taking its only key: a guardian answers
  `{sparent, username, password}`, since the school issues the login at the same time and
  `loginNote` reads it out. Where the shape is genuinely unknown — the notice board's create is
  typed `unknown`, the two conversation endpoints have never been run — the handler says `noNewId`
  and says why, so the blank is a decision somebody took rather than one nobody noticed.
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
of students, not thousands, so `A_SCHOOL` in `reference.ts` is the size the registers are fetched at
and the one place a change of scale shows up. A school in the thousands wants the student and
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
- **The cached identity is kept wherever the token is kept**, and a `/users/me` naming somebody else
  ends the session. Those are one rule seen twice. A sign-in with "remember this device" unticked
  leaves its token in `sessionStorage`, which is one tab's alone, while the identity used to go to
  `localStorage` whatever the token did — so two tabs on a staff-room laptop had a token each and
  one identity between them, and reloading the older tab hydrated somebody else's identity over its
  own token. The portal guard reads the cached role, so a student's tab opened the office's portal:
  every request in it was refused by the school, but the device's own records were already on the
  screen. `session.store.ts` now persists beside the token, `endSession` and a boot sweep clear what
  is left of an identity with no token, and `namesSomebodyElse` in `role.ts` — which replaced
  `accountOfRecord`, written when bronze's `me` ignored the header and handed back Super Admin —
  ends the session rather than discarding the answer.
- **A row that has not synced is read-only** until it does — `src/features/collections/unsynced.ts`,
  recognised by its `local:` id. This is what lets the queue avoid chained edits on records the
  school has never seen: an edit would name an id that does not exist yet, so the queue would need a
  dependency graph, resolved at send time and unpicked when the create it depended on failed. One
  rule removes all of it. The edit route and the delete button are withheld, and both write hooks
  refuse such an id loudly in case something gets past them. **It does not open, either** — the row
  takes no click, draws no chevron and offers no "Open the …" (`canOpen` on the data table), because
  every panel behind a record is a request naming its id: opening a queued enrolment asked the school
  for `/students/local:7ec2…/invoices` and got back "No API endpoint matches", which is a true
  sentence about a question nobody should have asked. The detail page withholds its tabs, its flows
  and its row link for the same record, since a reader can arrive by address whatever the register
  does — **every door off a queued record is shut, not just the first one.** The row link is
  withheld in `collection-list.tsx` rather than in each definition, so nobody has to remember.
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
  students while the database was deleted underneath it. On a shared staff-room laptop that is the
  whole point of wiping at all.
- **Signing out wipes the device's database**, including the SQLite write-ahead log and the VFS page
  pool — a `.sqlite` deleted on its own leaves rows in `-wal`. School machines are shared.
- **The school's clock is anchored across reloads.** `src/lib/server-clock.ts` keeps the last
  offset in `localStorage`, so a student sitting an assignment on a laptop that is ten minutes fast
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
  its own. The outbox raises the same sentence, and **every write is owed exactly one** — whoever
  speaks first takes the right to, so a write that was held and then landed cannot raise two that
  contradict each other.
- **"Saved on this device" is said when it is true, never on a stopwatch.** It is now knowable
  rather than guessable at the moment the write settles, because the send has already been tried:
  the device was offline, or the school could not be reached.
- **A write held after a failed attempt starts its backoff, not at zero.** Otherwise the drain picks
  it straight back up and spends a second attempt on the connection that had just failed — two
  failures milliseconds apart, the second overwriting the school's reason with the same reason.
- **The old stopwatch, for the record.** It used to be raised by
  a 1.2s timer, and a round trip to this school is about a second on a good connection — so an
  office with full signal was told its work had been held offline nearly every time it saved
  anything. Slowness is not a failure. The sentence is raised at the two moments the write is
  genuinely deferred: the device is offline when it is written, or the drain tried it and could not
  reach the school. In between it is simply in flight, and the bar under the header is the thing
  that says so.
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
  **The reads are dropped twice: once at once, and again after the device's own sets have caught
  up.** A derived read built *out of* a collection — a record's sub-table counting `heldRows`, a
  count tile, a register still on the query path — is a snapshot of what the set held when it last
  ran, not a live query, so starting the resync and the invalidation together let the refetch beat
  the sync: it re-read the rows the write had just made stale, wrote them back as fresh, and
  nothing ran again when the school's answer landed. A teacher who filed a topic had to reload the
  page to see it. The prompt pass stays because most derived reads are not built on a set at all —
  the dashboards, the audit log, the pickers — and should not wait on a sync they have nothing to
  do with; the second costs only what is on screen, since an invalidated query with no observer
  refetches nothing. `alsoDropOnWrite` hands back a promise for this, and a refusal drops the reads
  too: a device that could not reach the school still has to stop showing what the write replaced.
- **A form does not ask a question with one answer.** The teacher form used to offer a country above
  the state; the school numbers countries its own way, publishes no catalogue, and the only states
  anybody has been able to number are Nigeria's — so every other country in that list led to an
  empty State box. The state stands alone now and `teacherBody` sends the country the state ids
  were generated for, never a number written out here, so the two cannot name different places. No
  state means no country either: an address reading "Nigeria" and nothing else is this form
  inventing a fact nobody entered. The `states` feed reads an absent scope as Nigeria, which
  reaches only a field that never declared a `dependsOn` — one that declares an empty one does not
  run the feed at all — so the student form, which still asks, is untouched.
- **A student's email is optional, and it is not reliably their login.** It usually becomes one, but
  of four students read off this school two sign in with an address that is not the one on their
  record, and the test login on file is a registration number. The school issues the username itself
  and `POST /students` does not report it back — unlike a guardian's create, which answers with the
  login beside the record — so what a student signs in with is read off the record afterwards. An
  empty box is dropped rather than sent blank, which also means an email can be added later but not
  taken off: only `mname` and `previousschool` go as null.
- **The shortest password the app accepts is `MINIMUM_LENGTH` in `features/auth/password.ts`, and
  it is written nowhere else.** Six, which is what the sign-in field has always taken: a reset
  screen may not set a bar higher than the door it lets people back through, or somebody locked out
  of their own portal would be asked for a password they could then never sign in with. The
  checklist's own label is built from the constant for the same reason — it used to say "Ten
  characters or more" beside a validator that was free to change under it. Three of the four rules
  is still the bar (`MINIMUM_SCORE`), and six plain characters reach it without a symbol; the reset
  screen, the first-sign-in screen and the profile page's form all read the one figure.
- **A portal opened on the password the office issued is gated, not merely warned.**
  `/users/me` carries `isdefaultpassword` on every answer, so it is read off the stored account
  rather than remembered from the sign-in — `usingDefaultPassword` in `features/auth/role.ts`, and
  `DefaultPasswordGate` in `AppShell`, once for all four portals. Two things about the flag are
  load-bearing. It is the *word* `"true"`, so `Boolean(flag)` would gate the whole school on
  `"false"`; and a deployment that does not send it at all is a no, because a portal must never be
  shut on a question the school was never asked. Nothing dismisses the gate — no Escape, no scrim,
  no close button — but it offers the way out as well as the way through, since somebody at a
  shared staff-room machine who cannot reach their email has to be able to hand the laptop back.
  The way through is the recovery flow the app already has, started from the gate so nobody retypes
  the username they just signed in with: **this API has no signed-in change-password endpoint** —
  `users/change-password` wants the verification key from an invitation email and
  `users/reset-password` wants the OTP ticket, which is also why the profile page's own form still
  writes nothing and why `/first-sign-in` goes nowhere. One consequence is written down rather than
  discovered: a flagged account with no connection cannot get through the gate at all, because
  there is no offline way to set a password the school will accept.
- **A shell route must never throw.** Its error boundary replaces the shell, and a missing pending
  component blanks the page. Portal route loaders start their work and swallow the failure.
- **A field somebody writes prose into is the editor, not a textarea.**
  `RichTextEditor` (`src/components/editor/`) on the way in, `RichTextView` on the way back, both
  lazy and both against the one schema in `extensions.ts` — which is also the sanitiser, since a
  stored body is parsed against it rather than set as HTML on an element. A record form asks for one
  with `rich: true`, and a field declared `rich` in a `form` must be declared `rich` in the `detail`
  beside it or the panel draws the tags. What is *not* the editor: an address, a teller reference,
  an arm's description — short structured values, where HTML is noise the API then has to store.
  Three rules follow. **Emptiness is `hasText`, never a trim** — an emptied editor hands back
  `<p></p>`, which is a non-empty string and passes every check made on one. **A preview is
  `plainText`** — an inbox row, a notification, a search haystack; anything that clamps prose to a
  line strips the markup rather than drawing it. And **a field that holds both asks which it is**
  with `isRichText`: the same column carries the sentence somebody typed before the editor was put
  there and the HTML written since, so drawing the first through the editor is harmless and drawing
  the second as text shows `<p>` to a parent.
- **`src/index.css` is the only source of design truth** — the hybrid token system, soft raised
  surfaces, and danger and success as the only colours beside brand.
- **The design's own greys are `--ui-*`, and the brand ramp is anchored on its blue.** They arrived
  with the sign-in screens and now carry the shell and the office's pages too, which is why
  `--ems-brand` is `#356ead`: two near-identical blues side by side is the one thing a half-applied
  design always looks like. `--ui-field` fills an input, `--ui-line` fills a table's header band,
  and both have a dark half — the rest of the set is either colour-agnostic or reached only from
  `src/features/auth/`. Tile accents (`--tile-*`) are decoration and nothing else: they let somebody
  find a figure by its colour, and no other component may reach for them.
- **The sign-in screens are drawn light-only**, so the layout carries `.auth-daylight`, which
  re-declares the light tokens *and the shadcn aliases over them* — an alias is resolved where it is
  declared, so a container that redeclares `--ems-ink` alone still inherits `<html>`'s resolved
  `--muted-foreground`, which under a dark theme is pale grey on the sign-in page's white. Their
  fields are `AuthField`, not `TextField`: sharing one component between a record form the office
  fills in forty of and a single field on a white page would mean a variant flag on every rule in it.
- **The sign-in page is measured against the height of the screen, not the width of it.** Its
  spacing, its two headlines and the height of a field are `--auth-*` clamps in `index.css` and are
  set nowhere else — `clamp(2.5rem, 13vh, 8.75rem)` above the mark, and so on down. Height is the
  axis a laptop is short on: the design was drawn tall, and read literally it put the Login button
  under the fold of a 14-inch laptop, whose viewport is nearer 660px than 900 once the browser's own
  chrome comes off. Clamps rather than a breakpoint, so a screen an inch shorter is an inch tighter
  rather than a different layout, and `vh` rather than `dvh`, or the page would breathe with a
  phone's address bar. Two things follow from the same fact: the poster is `h-dvh` and sticky, so a
  form taller than the window — the reset screen is three password fields, a strength bar and a list
  of rules — no longer stretches the blue panel past the top of the screen; and the student is the
  last item in a flex column rather than a photograph placed at the panel's foot, so the room the
  words leave is what bounds her. Sized against the panel's width alone, she was drawn over the
  sentence.
- **A page is cards on a ground, and the shell is a rail and a bar.** The rail (264px) is the mark,
  the portal's context card, sections that open onto their pages, and Tools — settings and the way
  out — at its foot. The header is the search box and whoever is signed in; the page's own title is
  **not** there any more, because every screen already opens with it and saying it twice cost the
  width the search now has. `PageHeader`'s kicker is what is left of the breadcrumb.
  **Search and Notifications are the header's, not the rail's.** Each already had a door in the bar
  — the box on the left and the bell on the right — so a row for either in the rail was a second
  way to the same page, taking a line from the menu on every screen. The header's box is now a
  door too rather than a field: typing the surname there and landing on a page with its own box,
  autofocused and beneath the one still holding the term, meant two boxes and only one of them
  right. Every portal's `/notifications` route stays exactly where it was; the bell is how it is
  reached. Everything
  below sits in a `Panel`: white on the ground with a soft shadow and no border. The shadow is
  there because the ground alone could not do the job it was given — `--ems-ground` and
  `--ems-raised` are #fafafa and #ffffff, a 2% difference that reads as one flat page rather than a
  card standing on it — and a border is still refused, since a page of bordered cards is a page of
  lines. The register, its search row and its pager are one card; a record form is one card; a
  dashboard is a card per figure. **A figure card carries `--ems-figure`, not the panel's white**:
  the counted tiles over a register sit *inside* a panel, so flat made them white on white and they
  read as loose text. The token is declared in both themes because the themes need opposite tools —
  in daylight an edge and a shadow, at night a fill lifted above whatever it stands on, since a
  shadow on near-black is nothing.
- **The shell is measured against the height of the screen; a page is measured against the width of
  its own column.** Two halves of one rule, and each is the axis that squeezes.
  The rail and the header are pinned to the viewport, so whatever they take the page does not get:
  their sizes are `--shell-header` and the `--rail-*` clamps in `index.css` and are set nowhere
  else. On a 14-inch laptop at 1366x660 the rail was spending 321 of 660 on its mark, the term card
  and Tools, leaving a 323px window onto a 622px menu — half the office's navigation under the fold
  on every page. `shell-pending.tsx` draws the same clamps, or the shell changes size as it fills in.
  The page is the other axis, and **the width that matters is the content column's, not the
  window's**: they are 312px apart inside a portal — the rail plus the page's padding — so a
  `lg:`/`xl:` on anything under `AppShell` is asking about a box the content is not in. Measured, it
  was wrong exactly where a laptop sits: at a 1279px window the four headline figures of every
  dashboard were two cards 476px wide, and at 1281 they were four. So the content column carries
  `@container/page` and pages query *it* (`@3xl/page:grid-cols-…`); a strip of equal things skips
  the query and asks for `repeat(auto-fit, minmax(…))`, which has no edge to fall off. Keep viewport
  breakpoints for what genuinely fills the window — the landing page, the sign-in split, a dialog.
  Type is left alone on this axis: the portal reads at 15px with 24px titles, and the fix for a
  crowded 14-inch screen is the chrome around the words, not smaller words.
- **A tab whose rows are prose is panels, not a table.** `DetailTab.accordion` names the row keys —
  the heading, the body it opens onto, optionally a quieter line under the heading — and the tab
  draws `Accordion` instead of `TableView`. Topics taught is the case that forced it: as columns the
  useful half was the one an ellipsis cut, and a cell wide enough to hold a scheme of work scrolled
  the frame sideways on a phone. The first panel opens on arrival, because a tab holding one topic
  that says nothing until it is clicked reads as an empty tab. The body is asked whether it is rich
  text rather than assumed either way — the same column holds sentences typed before the editor
  existed and HTML written since — and `columns` is optional on a tab that declares one of these,
  since it draws none.
- **A record that belongs inside another one is read and written from that one, not from a register
  of its own.** A topic is taught in a subject, so the scheme of work lives on the subject's page:
  a `Topics taught` tab, filtered off the device — `GET /teachers/me/topics` takes no subject and
  the whole set is held anyway, which is also what lets the tab fill in a classroom with no signal —
  and an **Add topic** button beside it. There is no `/teacher/topics` any more, and nothing in the
  rail offers one. Three things carry it, all on the shared definition so the next one costs
  nothing: `DetailTab.add` opens the create form for another collection with the record in front of
  the reader already chosen (`presetSearch`, tested, on both portals' create routes — a preset seeds
  the form and no more, so a link carrying the wrong id is still the teacher's to correct);
  `DetailTab.rowRecord` opens a row's own record page, which `rowTo` cannot say because it names a
  `ListPath` and there is no longer a list; and `homeLabel` names the way back, since "Back to
  topics taught" would promise a page that does not exist. A definition rehomed this way wants a
  `scope` as well — `path` is part of the key its rows cache under, and it now shares one.
  The subject's record stopped being a modal in the same change: a modal draws no sub-tables, by
  design, because a register thin enough for one has no real tabs to show.
- **A row's action lives in the menu at the end of the row, not as a button on it.** `RowMenu`:
  the way into the record first — "Open the {noun}" — then whatever this row can be made to do. The
  button it replaced was a word that changed per row (Suspend beside Reinstate beside nothing at
  all), so a column of them read as a column of different buttons and the width came off the columns
  holding the record. A register that only opens keeps its plain chevron, because a menu of one item
  is a worse door than an arrow, and a row with nothing to offer draws no menu at all. The phone's
  card layout keeps its buttons: a card has the room a row does not.
  **A row action states its `tone`.** The menu colours the item by it and the confirm dialog dresses
  itself by it, and both default to danger — which was invisible while only the dialog read it, and
  is not once a red crossed-circle sits beside "Enable sign-in". Every toggling action now says which
  direction takes something away and which puts it back.
- **A register's page count is the list's own figure, never re-derived from the rows on screen.**
  `Paged` carries `pages`, and `Pagination` draws its run from that. It used to work the count
  back out as `total / (to - from + 1)` — the rows in front of you taken for the page size — which
  is right only while the page is full: eleven students at eight to a page put four rows on page 2,
  four into eleven is three, and the pager offered a page 3 and a page 4 that hold nothing. One
  component pages every register in the app, so that was every register, and it appeared only once
  somebody left page 1. The window itself is `pageWindow` in `page-window.ts`, pure and tested,
  because the run it draws is a claim about how much the school holds.
- **A register's primary action sits beside the title, not in the filter row.** It was tried in the
  filter row, on the reasoning that the eye is already there having just read the title. The
  reasoning did not survive the screen: a register carries a search box and four filters, which on a
  laptop is already more than one line's worth, so the one button somebody came to press was the
  thing that wrapped — landing *under* the filters. `FilterBar` takes no `action`; `PageHeader`
  does.
- **Tests are `node --test` on pure logic.** A module under test uses relative imports with explicit
  `.ts` extensions, and no parameter properties (`erasableSyntaxOnly`). Anything risky in the local-
  first layer — failure classification, queue ordering, backoff, id substitution, the household
  composition, the banner's copy — is written as a pure function with a `.test.ts` sibling.
