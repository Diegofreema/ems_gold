/**
 * What each queued write actually does when its turn comes.
 *
 * A queued op names its handler by string rather than holding the function,
 * because the op outlives the page that made it: a register marked on Tuesday
 * afternoon is sent by whatever code is running on Wednesday morning, and a
 * closure cannot be written to SQLite. So the op stores a name and this map
 * turns it back into behaviour.
 *
 * This is also where the rule in CLAUDE.md has teeth. A new endpoint that
 * wants to be writable offline has to register here; there is no other way to
 * get into the queue.
 */
export type OutboxHandler<P = never> = {
  /** Sends it. The existing `src/api/<domain>/service.ts` function. */
  send: (payload: P) => Promise<unknown>
  /**
   * Whether sending the same payload twice is the same as sending it once.
   *
   * True for an upsert keyed on something the client already knows — taking a
   * register for an arm and a date, entering a mark for a student and a
   * subject. False for anything that creates a new row with a server-issued
   * id, because a replay makes a second one.
   *
   * It decides what happens to an op that was in flight when the tab died: an
   * idempotent one is simply sent again, and anything else has to be put to
   * the person, because this API has no idempotency keys and nothing on the
   * device can tell whether the school heard it.
   */
  idempotent: boolean
  /** The collection to refetch once it lands, so the row comes back as saved. */
  collectionId?: string
  /**
   * Something in the school's answer the person who wrote this needs told.
   *
   * A queued write's response comes back to the drain, not to the page that
   * made it — hours later, on another screen — so anything the endpoint says
   * about what it did has nowhere else to go. Returning nothing is the normal
   * case and says nothing.
   */
  note?: (answer: unknown) => string | undefined
}

const handlers = new Map<string, OutboxHandler<never>>()

export function registerHandler<P>(name: string, handler: OutboxHandler<P>): void {
  if (handlers.has(name)) {
    throw new Error(`Two outbox handlers are registered as "${name}".`)
  }
  handlers.set(name, handler as OutboxHandler<never>)
}

export function handlerFor(name: string): OutboxHandler<never> | undefined {
  return handlers.get(name)
}

/** Test seam. Nothing in the app calls this. */
export function clearHandlers(): void {
  handlers.clear()
}
