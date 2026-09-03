/**
 * The school's clock, as closely as this browser can follow it.
 *
 * Anything that times a person — an assignment's countdown above all — is
 * measured against this rather than `Date.now()`, because the device clock
 * belongs to the person being timed. Every API response carries a `Date`
 * header, so the offset between the two is re-read continuously and for
 * nothing; winding the device forward or back moves `Date.now()` and the
 * offset together, and the reading stays where it was.
 *
 * It is not a security boundary and cannot be made one here: a student who
 * edits the page can have any clock they like. What it stops is the ordinary
 * trick of changing the device's own time, and what it fixes for everyone else
 * is a laptop that is simply wrong by ten minutes. The deadline itself has to
 * come from the server before any of this can be leaned on — see the note in
 * `assignments/attempt.ts`.
 */

/** School time minus device time, in ms. Zero until a response has been seen. */
let offset = 0

/**
 * Reads a response's `Date` header. Anything missing or unparseable leaves the
 * offset alone rather than resetting it to zero — one odd response should not
 * throw away a good anchor.
 *
 * The header carries whole seconds and is stamped before the response travels,
 * so this runs up to a second or so behind. Nothing here is doing arithmetic
 * fine enough to care.
 */
export function noteServerTime(header: string | null | undefined): void {
  if (!header) return
  const server = Date.parse(header)
  if (Number.isNaN(server)) return
  offset = server - Date.now()
}

/** Epoch ms on the school's clock, falling back to this device's until anchored. */
export function serverNow(): number {
  return Date.now() + offset
}
