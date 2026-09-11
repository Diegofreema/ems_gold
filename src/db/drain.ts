import type { MutationToast } from '@/lib/mutation-toast'
import { queryClient } from '@/lib/query-client'
import { dropDerivedReads } from '@/features/collections/invalidate'
import { backoffFor, classify } from './classify'
import { refetchCollection } from './collection'
import { cascadeFrom, nextOp, substitute, unresolved, type OutboxOp } from './outbox'
import { onlyOneTab } from './one-tab'
import { handlerFor } from './registry'
import { idMap, isStoreReady, outbox, resolvedIds, storeReady } from './store'
import { announceFailed, announceHeld, announceNote, announceSaved } from './toast'

export type EnqueueSpec = {
  /** A name registered in `registry.ts`. */
  handler: string
  payload: unknown
  /** Refetched once this lands, so the row comes back as the school has it. */
  collectionId?: string | null
  /** The row this is about: a real id, or `local:<uuid>` for a new one. */
  targetKey?: string | null
  dependsOn?: string[]
  /** The same `meta` the mutation cache would have raised. */
  toast: MutationToast
  /** What this was, in the reader's words. Shown if it fails later. */
  label: string
}

/**
 * Set when the school refuses the token.
 *
 * The whole queue stops rather than each op failing in turn: the work is fine,
 * the session is not, and burning thirty attendance marks against a dead token
 * would turn a sign-in problem into lost work. Cleared by a fresh sign-in, and
 * by somebody pressing "Send now" — see `sendNow`.
 */
let pausedForAuth = false
let draining = false
let timer: ReturnType<typeof setInterval> | null = null

/** Opens the pending-work drawer. Set by the shell once it is mounted. */
let openDrawer: () => void = () => {}
export const setDrawerOpener = (open: () => void) => {
  openDrawer = open
}

/**
 * Accepts a write on the device and puts it in line for the school.
 *
 * Returns as soon as it is written down, not when it is sent — that is the
 * whole point. The toast decides for itself which sentence to use, once it
 * knows whether this was a moment's wait or a trip to the queue.
 */
export function enqueue(spec: EnqueueSpec): OutboxOp {
  // The boot path and every sign-in await `storeReady()`, so by the time a
  // screen exists to call this, the queue has loaded. If that ever stops being
  // true this has to fail loudly: numbering an op against a half-loaded queue
  // silently reorders somebody's afternoon.
  if (!isStoreReady()) {
    throw new Error('A write was queued before the device had finished loading its queue.')
  }

  const seqs = outbox().toArray.map((op) => op.seq)
  const now = Date.now()

  const op: OutboxOp = {
    id: crypto.randomUUID(),
    seq: (seqs.length > 0 ? Math.max(...seqs) : 0) + 1,
    handler: spec.handler,
    payload: spec.payload,
    collectionId: spec.collectionId ?? null,
    targetKey: spec.targetKey ?? null,
    dependsOn: spec.dependsOn ?? [],
    createdAt: now,
    attempts: 0,
    nextAttemptAt: now,
    state: 'queued',
    lastError: null,
    toast: spec.toast,
    label: spec.label,
  }

  outbox().insert(op)
  announce(op)

  /*
   * A write accepted on the device makes what is derived from it stale *now*,
   * not when the school eventually hears about it — that is the whole claim
   * this app makes. A register reading a live query follows the queue by
   * itself; the figures above it are react-query, and without this they went on
   * showing the school's last answer beside a row the office had just changed.
   */
  void dropDerivedReads(queryClient)
  void drain()

  return op
}

/**
 * Every write is owed exactly one sentence, and this decides which.
 *
 * It used to be decided by a stopwatch: the queue waited 1.2 seconds and, if
 * the write had not landed by then, told the reader it was being kept on the
 * device. That read the wrong thing off the clock. A round trip to this school
 * takes about a second on a perfectly good connection and longer for anything
 * that writes, so an office with full signal was told its work had been held
 * offline nearly every time it saved anything — which is both untrue and
 * exactly the sentence that makes somebody distrust the rest of the screen.
 * Worse, the op was never taken off the pending list, so when it did land a
 * second toast said the opposite of the first.
 *
 * Slowness is not a failure. So nothing is said about the device until the
 * write has actually been deferred, which is knowable rather than guessable:
 * the device is offline when it is written, or the drain tried it and could
 * not reach the school. In between, the write is simply in flight — and the
 * bar under the header is already saying so, which is the right place for a
 * sentence about work that has not settled yet.
 *
 * A screen that shows its own error keeps `ownsError` for the prompt case. Once
 * a write is in the queue there is no screen left to own anything, so a later
 * failure is announced by the drain regardless.
 */
function announce(op: OutboxOp): void {
  // Known now, and nothing is going to be attempted: say so at once rather
  // than leaving somebody with no answer at all.
  if (!navigator.onLine) {
    announceHeld(op.toast)
    return
  }

  // Otherwise it is owed one, and what happens to it decides which: `landed`
  // says it was sent, `deferred` says it is being kept.
  pendingAnnouncements.add(op.id)
}

/**
 * Ops still owed their one sentence.
 *
 * Membership is the right to speak, and it is taken by whoever speaks first —
 * which is what stops a write that was held and then landed raising two
 * toasts that contradict each other.
 */
const pendingAnnouncements = new Set<string>()

/**
 * Says the write is being kept, at the moment that becomes true.
 *
 * Only once. A queue serving out a backoff tries the same op every few
 * seconds, and a reader does not need telling each time that the school is
 * still out of reach — the bar under the header is holding that thought.
 */
function deferred(op: OutboxOp): void {
  if (pendingAnnouncements.delete(op.id)) announceHeld(op.toast)
}

/**
 * Sends what it can, in the order it was done, and stops at the first thing it
 * cannot.
 *
 * One at a time and strictly by `seq`, across every collection — writes depend
 * on each other (a child is added before the invoice raised against them), and
 * a queue that reorders them produces errors about rows that do not exist yet.
 */
export async function drain(): Promise<void> {
  if (draining || pausedForAuth || !navigator.onLine) return
  draining = true

  try {
    // One tab sends, whoever is signed in. `draining` above is this tab's own
    // guard; the lock is the one that matters when the school laptop has two
    // tabs open on the same queue — see `one-tab.ts`.
    await onlyOneTab(sendWhatWeCan)
  } finally {
    draining = false
  }
}

async function sendWhatWeCan(): Promise<void> {

  // Cheap once it has resolved, and the difference between sending what is
  // waiting and deciding there was nothing to send.
  await storeReady()

  // Whether anything actually reached the school this pass. What a write makes
  // stale is dropped once at the end rather than after each op: a register of
  // thirty marks drains as thirty ops, and dropping every derived read thirty
  // times over would ask the school for the same answers thirty times.
  let sent = false

  try {
    for (;;) {
      const op = nextOp(outbox().toArray, Date.now())
      if (!op) break

      const handler = handlerFor(op.handler)
      if (!handler) {
        // The op names something this build no longer has. Replaying it is
        // impossible and dropping it silently would lose somebody's work, so
        // it goes to the drawer to be looked at.
        settle(op, 'needs-review', `This app no longer knows how to send "${op.handler}".`)
        continue
      }

      const ids = resolvedIds()
      const waiting = unresolved(op.payload, ids)
      if (waiting.length > 0) {
        // Whatever was going to create these has already been and gone —
        // head-of-line order guarantees it ran first — so it must have failed.
        fail(op, `Waiting on a record that was never created.`)
        continue
      }

      outbox().update(op.id, (draft) => {
        draft.state = 'sending'
      })

      try {
        const answer = await handler.send(substitute(op.payload, ids) as never)
        await landed(op, handler.collectionId ?? op.collectionId, answer)
        // Anything the school said about what it actually did with this. The
        // page that wrote it is long gone, so the drain is the only place left
        // that can pass it on.
        const note = handler.note?.(answer)
        if (note) announceNote(note)
        sent = true
      } catch (error) {
        if (!handleFailure(op, error)) break
      }
    }
  } finally {
    // Also on the way out of a queue that stopped part-way: what did land is
    // on the school's record whatever became of the op behind it.
    // A migrated write still makes un-migrated derived reads stale — a teacher
    // saving a topic moves a dashboard that is still on the query path — and
    // it makes the device's own sets stale too, which no invalidation reaches.
    if (sent) await dropDerivedReads(queryClient)
  }
}

/** Records the school's own id for a row this device named, then clears the op. */
async function landed(
  op: OutboxOp,
  collectionId: string | null | undefined,
  answer: unknown,
): Promise<void> {
  if (op.targetKey?.startsWith('local:')) {
    const real = readId(answer)
    if (real !== undefined) {
      idMap().insert({ id: op.targetKey, real, at: Date.now() })
    }
  }

  outbox().delete(op.id)

  if (pendingAnnouncements.delete(op.id)) announceSaved(op.toast)

  // The school's version of the row, rather than ours. Targeted, and per op,
  // because this is the set the op was actually about; everything else a write
  // makes stale is dropped once at the end of the drain.
  if (collectionId) await refetchCollection(collectionId)
}

/** True when the drain may carry on; false when the whole queue must stop. */
function handleFailure(op: OutboxOp, error: unknown): boolean {
  const verdict = classify(error)
  const message = error instanceof Error ? error.message : String(error)

  if (verdict === 'auth') {
    pausedForAuth = true
    // Back to `queued`, untouched: this attempt never counted.
    outbox().update(op.id, (draft) => {
      draft.state = 'queued'
      draft.lastError = message
    })
    return false
  }

  if (verdict === 'retryable') {
    outbox().update(op.id, (draft) => {
      draft.attempts += 1
      draft.nextAttemptAt = Date.now() + backoffFor(draft.attempts)
      draft.state = 'queued'
      draft.lastError = message
    })
    // The school could not be reached, so the write is now genuinely being
    // kept on the device — which is the one moment worth saying so.
    deferred(op)
    return false
  }

  fail(op, message)
  announceFailed(op.label, error, openDrawer)
  return true
}

/** Fails an op and everything that was waiting on it. */
function fail(op: OutboxOp, message: string): void {
  settle(op, 'failed', message)

  for (const id of cascadeFrom(outbox().toArray, op.id)) {
    const dependent = outbox().get(id)
    if (!dependent || dependent.state === 'failed') continue
    settle(dependent, 'failed', `Waiting on "${op.label}", which could not be saved.`)
  }
}

function settle(op: OutboxOp, state: OutboxOp['state'], message: string): void {
  pendingAnnouncements.delete(op.id)
  outbox().update(op.id, (draft) => {
    draft.state = state
    draft.lastError = message
  })
}

/** The id the school issued, from whichever shape the endpoint answered in. */
function readId(answer: unknown): string | number | undefined {
  if (answer === null || typeof answer !== 'object') return undefined
  const id = (answer as { id?: unknown }).id
  return typeof id === 'string' || typeof id === 'number' ? id : undefined
}

/**
 * Puts back anything that was in flight when the tab died.
 *
 * An idempotent write is simply sent again. Anything else cannot be: this API
 * has no idempotency keys, so nothing on the device can tell whether the
 * school heard it, and guessing either way risks a duplicate record or a lost
 * one. It goes to the drawer for a person to decide.
 */
export function recoverInterrupted(): void {
  for (const op of outbox().toArray) {
    if (op.state !== 'sending') continue

    const idempotent = handlerFor(op.handler)?.idempotent ?? false
    outbox().update(op.id, (draft) => {
      draft.state = idempotent ? 'queued' : 'needs-review'
      if (!idempotent) {
        draft.lastError = 'This may already have been saved. Check before sending it again.'
      }
    })
  }
}

/** Sends an op the reader has looked at and told us to send. */
export function retry(id: string): void {
  outbox().update(id, (draft) => {
    draft.state = 'queued'
    draft.attempts = 0
    draft.nextAttemptAt = Date.now()
    draft.lastError = null
  })
  // Through `sendNow` rather than `drain` for the same reason the banner's
  // button is: a person pressing "try again" against a queue that is serving
  // out a backoff, or paused on a token that has since been replaced, was
  // pressing a button that returned at the first guard.
  sendNow()
}

/**
 * What a person means when they press "Send now": try it, now, whatever the
 * queue had decided to do about it.
 *
 * `drain()` on its own could not honour that, and the button was dead in every
 * state it was shown in. It returns at the `pausedForAuth` guard, which only a
 * fresh sign-in cleared; and where the head of the queue is serving out a
 * backoff, `nextOp` hands back nothing, so the pass runs and sends nothing.
 * Both are right for the timer, which is asking on its own initiative. Neither
 * is right for somebody who has looked at the banner and asked for it.
 *
 * So this clears both: the pause, because the token may well have been
 * replaced since, and the waiting, because the person in front of it knows
 * more about the connection than the backoff does. An attempt that fails for
 * the reason it failed before costs one request and no work — an auth refusal
 * burns no attempts and puts the pause straight back.
 */
export function sendNow(): void {
  pausedForAuth = false

  const now = Date.now()
  for (const op of outbox().toArray) {
    if (op.state !== 'queued' || op.nextAttemptAt <= now) continue
    outbox().update(op.id, (draft) => {
      draft.nextAttemptAt = now
    })
  }

  void drain()
}

/** Throws an op away, and everything that was waiting on it. */
export function discard(id: string): void {
  for (const dependent of cascadeFrom(outbox().toArray, id)) outbox().delete(dependent)
  outbox().delete(id)
}

/** A fresh sign-in clears the reason the queue stopped. */
export function resumeAfterSignIn(): void {
  pausedForAuth = false
  void drain()
}

export const isPausedForAuth = () => pausedForAuth

/**
 * Starts the queue watching for its chance.
 *
 * Reconnecting is the moment that matters; the interval is for the connection
 * that comes back without the browser noticing, and for backoffs coming due.
 */
export async function startDrain(): Promise<void> {
  if (timer !== null) return

  await storeReady()
  recoverInterrupted()

  // Once for the life of the tab: the drain is stopped and started again when
  // a sign-in rebinds the store, and a listener added per start would fire the
  // drain twice for one reconnection.
  if (!listeningForOnline) {
    listeningForOnline = true
    globalThis.addEventListener?.('online', () => void drain())
  }
  timer = setInterval(() => {
    if (outbox().toArray.length > 0) void drain()
  }, 15_000)

  void drain()
}

let listeningForOnline = false

export function stopDrain(): void {
  if (timer !== null) clearInterval(timer)
  timer = null
  draining = false
  pendingAnnouncements.clear()
}
