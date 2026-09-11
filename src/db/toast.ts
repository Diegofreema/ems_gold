import { toast } from 'sonner'
import { errorMessage } from '@/lib/errors'
import type { MutationToast } from '@/lib/mutation-toast'

/**
 * The suffix, built in one place rather than written into each definition.
 *
 * The sentence in front of it is the same one the mutation cache raises for
 * every write that has not been migrated — the definition still says
 * "Topic added" and nothing else.
 *
 * It no longer promises the connection specifically. This is raised when a
 * write has actually been deferred, and there are two ways to get there: the
 * device is offline, or the school could not be reached — a dead link behind a
 * connection the browser still calls online, a 503, a socket that stopped
 * answering. "When you are back online" was wrong for half of those.
 */
const HELD = 'saved on this device. It will send as soon as the school can be reached.'

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

/**
 * What the school said it did, where that is not simply "saved".
 *
 * Neither a success nor a failure: the write landed, and the answer carried
 * something the teacher would otherwise have to count the rows to notice.
 */
export function announceNote(note: string): void {
  /*
   * Left up until it is dismissed. By the time a note fires, whoever wrote the
   * thing is somewhere else entirely — that is what makes it a note from the
   * drain rather than an answer on the screen — and one of these carries a
   * household's first password, which nothing will ever say again.
   */
  toast.warning(note, { duration: Infinity, closeButton: true })
}
