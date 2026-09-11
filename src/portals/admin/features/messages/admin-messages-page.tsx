import { MessagesPage } from '@/features/messages/components/messages-page'

/**
 * The office's side of the in-app messages.
 *
 * Two things are the office's alone. An administrator is on **everybody's**
 * contacts list, so this is where a parent's question about fees and a
 * teacher's about a register both land; and an administrator may **close** a
 * thread, which is the moderation the endpoint reserves for them — a closed
 * conversation takes no more replies from either side.
 *
 * No child picker: naming which pupil a thread is about is the guardian's
 * knowledge, and the office would be picking from the whole register.
 */
export function AdminMessagesPage() {
  return (
    <MessagesPage
      kicker="School"
      description="Conversations between the office, the staff room and guardians. Administrators can read and close any thread — the office moderates these. Everything here is on this device, so it can be read with no connection, and a reply written offline sends itself when the signal comes back."
      canClose
    />
  )
}
