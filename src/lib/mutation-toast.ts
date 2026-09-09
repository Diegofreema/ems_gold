/**
 * What a write says when it succeeds, and whether the screen would rather say
 * it itself.
 *
 * Its own module rather than living beside the mutation cache that raises it,
 * because the local-first queue raises the same sentence for writes that never
 * touch react-query — and the queue's pure logic is covered by `node --test`,
 * which cannot follow an import into browser code.
 */
export type MutationToast = {
  /** Shown on success, written as the thing that just happened. */
  success: string
  /** Set when the screen reports the failure itself — the sign-in alert, say. */
  ownsError?: boolean
}
