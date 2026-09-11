import type {
  ConversationStatus,
  ConversationThread,
} from '../../api/conversations/types.ts'
import { looseId, looseText, pick } from '../collections/loose.ts'

/**
 * Reading one thread, whose shape nobody has seen.
 *
 * `GET /conversations/{id}` has never been fired on this deployment — the
 * inbox and the contacts list have, the thread has not — so which key holds
 * the messages and what a message calls its own fields is a guess. Rather
 * than pin one spelling and draw an empty thread for ever if it turns out to
 * be another, every field is read for the first candidate that actually
 * carries something, in one place, under test.
 *
 * This whole module is meant to be **deleted down to one spelling** the first
 * time somebody reads a real thread. Until then it is honest about being a
 * guess, and a thread that arrives in none of these shapes reads as a thread
 * this app cannot display — which is a sentence to show, not a blank panel.
 */

export type ThreadMessage = {
  /** Stable within the thread — the server's id where there is one. */
  key: string
  body: string
  senderId: number | undefined
  senderName: string
  /** However the server stamped it. Displayed as it arrived; never parsed. */
  at: string
  /** Written by whoever is reading, so it sits on the right of the thread. */
  mine: boolean
  /** Still in the outbox — said on this device, not yet with the school. */
  queued?: boolean
}

/** Where a thread's messages might live. First one carrying an array wins. */
const MESSAGE_KEYS = ['messages', 'conversation_messages', 'replies', 'items', 'posts']

/**
 * The messages, oldest first — the order a conversation is read in.
 *
 * The server's order is trusted as it arrives. Sorting on a stamp would mean
 * parsing one, and the inbox's own stamp is a pre-formatted `"9/8/26, 11:12
 * AM"` with no zone: parsing that is how a thread ends up in the wrong order
 * on a phone set to a different locale.
 */
export function threadMessages(
  doc: ConversationThread | undefined,
  meId: number | undefined,
): ThreadMessage[] {
  const rows = pick(doc, ...MESSAGE_KEYS)
  if (!Array.isArray(rows)) return []

  return rows.map((row, index) => {
    const record = (row ?? {}) as Record<string, unknown>
    const senderId = looseId(
      pick(record, 'user_id', 'sender_id', 'from_id', 'author_id', 'sender', 'from'),
    )
    return {
      key: String(pick(record, 'id', 'message_id') ?? `row-${index}`),
      body: text(record, 'body', 'message', 'content', 'text'),
      senderId,
      senderName: text(record, 'sender_name', 'from_name', 'name', 'sender', 'posted_by', 'from'),
      at: text(record, 'created', 'created_at', 'datecreated', 'sent_at', 'timestamp', 'date'),
      mine: senderId !== undefined && meId !== undefined && senderId === meId,
    }
  })
}

/**
 * Whether the answer looked like a thread at all.
 *
 * A thread with no messages is a real state — a conversation whose only
 * message is the one that started it may well arrive under a key this does
 * not know. Telling the two apart is what stops the screen saying "no
 * messages" over an answer it simply could not read.
 */
export function isReadableThread(doc: ConversationThread | undefined): boolean {
  return Array.isArray(pick(doc, ...MESSAGE_KEYS))
}

/** The subject, falling back to what the inbox row already said. */
export function threadSubject(
  doc: ConversationThread | undefined,
  fallback: string,
): string {
  const subject = pick(doc, 'subject', 'title')
  return typeof subject === 'string' && subject.trim() ? subject.trim() : fallback
}

/** The status, falling back to what the inbox row already said. */
export function threadStatus(
  doc: ConversationThread | undefined,
  fallback: ConversationStatus,
): ConversationStatus {
  const status = pick(doc, 'status', 'state')
  return status === 'closed' || status === 'open' ? status : fallback
}

/** A field read for the first candidate key that carries anything. */
function text(record: Record<string, unknown>, ...keys: string[]): string {
  const value = pick(record, ...keys)
  if (value === undefined) return ''
  const read = looseText(value)
  return read === '—' ? '' : read
}
