import { BLANK } from '../../../features/collections/blank.ts'
import { formatDate } from '../../../lib/format.ts'

/**
 * A timestamp as the registers show it — the day alone, or the day with the
 * time on it.
 *
 * This API writes dates three ways: an ISO timestamp carrying the school's own
 * offset (`2026-08-27T09:23:47+01:00`), a bare one with no zone at all
 * (`payday`, `2026-08-27 09:23:47`), and `24 Oct 2022 19:02 pm` on rows raised
 * years ago. The third is already readable, so a date that will not parse is
 * shown as it was sent rather than as "Invalid Date".
 *
 * A bare timestamp is read as the reader's own clock, because it carries the
 * same wall clock as the ISO ones beside it — `receipt.issued_at` is
 * `09:23:47+01:00` against a `payday` of `09:23:47`. Both are the school's
 * time, and reading either as UTC would put the same payment an hour out from
 * itself.
 */
export function when(value: string | null | undefined, withTime = false): string {
  if (!value) return BLANK
  const at = new Date(value)
  if (Number.isNaN(at.getTime())) return value
  if (!withTime) return formatDate(at)
  return at.toLocaleString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}
