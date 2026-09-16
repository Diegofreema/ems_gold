/**
 * Reading the one refusal the return endpoint makes that a librarian cannot
 * act on, and saying it in words they can.
 *
 * Kept apart from the flow so it can be tested: this is a claim about the
 * school's own words, and the branch it controls is the difference between a
 * librarian being told which book is stuck and being shown an API path.
 */

/**
 * Whether the school refused because it cannot tell two copies apart.
 *
 * Read structurally rather than by `instanceof`: the flow catches whatever the
 * client threw, and a refusal that lost its class on the way through would
 * silently stop matching.
 *
 * Both halves are needed. The status alone is too broad — a copy already back
 * is a 409 too, and its sentence is one the desk *can* act on, so it must
 * reach them unchanged. The wording matched is the school's own: "Return the
 * one that came back by its loan id: POST
 * /api/admins/borrowed-books/{loanId}/return".
 */
export function needsTheLoanId(error: unknown): boolean {
  const refusal = error as { status?: unknown; message?: unknown } | null
  if (Number(refusal?.status) !== 409) return false
  return /loan\s?id|\{loanid\}/i.test(String(refusal?.message ?? ''))
}

/**
 * What the desk is told when the return is refused for that reason.
 *
 * Deliberately not the school's own sentence, which is the only place in this
 * app where an API path would be put in front of a librarian: "POST
 * /api/admins/borrowed-books/{loanId}/return" is a true thing to say to a
 * developer and no help at all to somebody holding a book at a counter. It
 * says what is stuck, that it is not their doing, and who can unstick it.
 *
 * It goes the moment the school can tell two copies apart — nothing else
 * raises it.
 */
export const BOTH_COPIES_STUCK =
  'The school system cannot take this one back yet: two copies of this title are out, and it has no way to tell which of them has come back. Nothing is wrong with the record — the counter will be able to close it once the school enables returning by loan.'
