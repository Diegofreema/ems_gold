import type { Id } from '@/api/types'
import type { ReplyBody, StartConversationBody } from '@/api/conversations/types'
import { enqueue } from '@/db/drain'
import { SET, WRITE } from '@/db/ids'
import { newLocalKey } from '@/db/outbox'

/**
 * Sending a message, from the composer, straight.
 *
 * Not through a `useMutation`: the write is accepted on the device and returns
 * at once, and wrapping something synchronous in a mutation put the mutation
 * cache, the router's loaders and react-hook-form's submitting state in front
 * of it — the form sat with its button spinning over a write that was already
 * safe. The queue raises its own toast, and adds "saved on this device" only
 * where the message actually had to wait.
 */

/** Opens a thread. The school issues its id, so the device names it locally. */
export function queueStart(body: StartConversationBody): void {
  enqueue({
    handler: WRITE.startConversation,
    payload: body,
    collectionId: SET.msgInbox,
    targetKey: newLocalKey(),
    toast: { success: 'Message sent' },
    label: body.subject.trim() ? `Message: ${body.subject.trim()}` : 'New message',
  })
}

/** Answers one. Named by the thread, so the drawer says which conversation. */
export function queueReply(id: Id, body: ReplyBody, subject: string): void {
  enqueue({
    handler: WRITE.replyToConversation,
    payload: { id, body },
    collectionId: SET.msgInbox,
    targetKey: String(id),
    toast: { success: 'Reply sent' },
    label: subject.trim() ? `Reply: ${subject.trim()}` : 'Reply to a conversation',
  })
}
