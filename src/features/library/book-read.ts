import type { Book } from '../../api/library/types.ts'

/**
 * Reading a catalogue row, whose `isavailable` field changed meaning under us.
 *
 * Until 2026-09-15 it was a **word** — `"Available"` / `"Unavailable"` — and
 * the office's own switch for whether a title was lent at all, with nothing to
 * do with how many copies were on the shelf. On 2026-09-16 bronze answered
 * with a **number** instead: book 1 reads `isavailable: 14` beside
 * `copies: 15`, and `GET /loanedbooks/stock/1` says `{copies: 15, on_loan: 1,
 * available: 14}`. So it is now the free-copy count, and the same figure the
 * lending picker already filters on.
 *
 * That change took the library register down rather than merely showing the
 * wrong word: the row handed a number to a column reader that trims strings,
 * and `filledColumns` threw `value.trim is not a function` through the whole
 * page. Which is the standing lesson in this codebase said once more — a
 * reader written against a shape is a guess, and this one was right when it
 * was written.
 *
 * Both shapes are read here so a deployment still on the old one is not
 * broken by the fix to the new one.
 */

/**
 * Copies free to lend, and null where the row does not say.
 *
 * Null is not nought: the old word carries no count at all, and treating
 * `"Available"` as nought free copies would empty a shelf of thirty.
 */
export function freeCopies(book: Pick<Book, 'isavailable'>): number | null {
  const value = book.isavailable
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  // A number the school sent as a string is still a number. Guarded on the
  // digits, or `Number('Available')` would read NaN as "no copies".
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) return Number(value.trim())
  return null
}

/**
 * What the register's Lending tag says.
 *
 * "All out" rather than "Unavailable" for a title with no free copy, and the
 * difference is worth the word: nothing is retired, every copy is simply
 * borrowed, and it goes back on the shelf when one comes back. `toneForStatus`
 * already knows both — "Available" reads green and "All out" red.
 *
 * A deployment still sending the word gets its own word back, since that one
 * really is the office's switch and "retired" is what it means.
 */
export function lendingLabel(book: Pick<Book, 'isavailable'>): string {
  const free = freeCopies(book)
  if (free !== null) return free > 0 ? 'Available' : 'All out'
  return typeof book.isavailable === 'string' && book.isavailable.trim()
    ? book.isavailable.trim()
    : 'Unknown'
}

/** Whether a copy could go out today, on whichever shape the row wears. */
export function canLend(book: Pick<Book, 'isavailable'>): boolean {
  const free = freeCopies(book)
  return free !== null ? free > 0 : book.isavailable !== 'Unavailable'
}
