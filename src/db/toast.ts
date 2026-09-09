import { toast } from 'sonner'
import { errorMessage } from '@/lib/errors'
import type { MutationToast } from '@/lib/mutation-toast'

/**
 * How long a write gets to reach the school before the reader is told it is
 * being kept on the device.
 *
 * The common case is somebody in the office with a connection, and for them
 * this should read exactly as it does today — one sentence, no mention of
 * queues or devices. So the queue waits a moment before saying anything about
 * itself.
 */
export const GRACE_MS = 1_200

/**
 * The suffix, built in one place rather than written into each definition.
 *
 * The sentence in front of it is the same one the mutation cache raises for
 * every write that has not been migrated — the definition still says
 * "Topic added" and nothing else.
 */
const HELD = 'saved on this device. It will send when you are back online.'

export function announceSaved(meta: MutationToast): void {
  toast.success(meta.success)
}

export function announceHeld(meta: MutationToast): void {
  toast.success(`${meta.success} — ${HELD}`)
}

/**
 * A write that failed long after the screen that made it has gone.
 *
 * Named rather than generic, because by the time this fires the reader is
 * somewhere else entirely and "Could not save" tells them nothing about what.
 */
export function announceFailed(label: string, error: unknown, onOpen: () => void): void {
  toast.error(`${label} could not be saved: ${errorMessage(error, 'the school refused it.')}`, {
    action: { label: 'Review', onClick: onOpen },
  })
}
