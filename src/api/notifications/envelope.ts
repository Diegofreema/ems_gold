import type { Notice, NoticeEnvelope } from './types.ts'

/**
 * Taking the notices out of an answer nobody has seen.
 *
 * Every read endpoint under `/notifications` 500s on bronze today — the
 * controllers are deployed, the table is not migrated — so the key the array
 * sits under is a guess. These read by shape instead of by name: the first
 * array is the list, the first object with a numeric `id` is the record, the
 * first number is the count. A wrong guess about `notifications` vs `notices`
 * vs `data` then costs nothing, and none of them can render an empty page for
 * a reason that is really a typo.
 *
 * Pure on purpose — no client, no `import.meta` — so it is testable.
 */

/** The first array in the envelope, whatever the server decided to call it. */
export function noticesIn(envelope: NoticeEnvelope | Notice[] | null | undefined): Notice[] {
  if (Array.isArray(envelope)) return envelope
  const found = Object.values(envelope ?? {}).find(Array.isArray)
  return (found as Notice[] | undefined) ?? []
}

/** The one notice in a detail envelope, wrapped under some key or bare. */
export function noticeIn(envelope: NoticeEnvelope | null | undefined): Notice | undefined {
  if (isNotice(envelope)) return envelope
  return Object.values(envelope ?? {}).find(isNotice)
}

function isNotice(value: unknown): value is Notice {
  return !!value && typeof value === 'object' && typeof (value as Notice).id === 'number'
}

/**
 * The badge number — `count`, `unread_count`, or an envelope that is just the
 * number. Zero where the answer holds no number at all, which is the safe way
 * to be wrong: a badge that does not appear beats one showing a made-up count.
 */
export function countIn(envelope: unknown): number {
  if (typeof envelope === 'number') return envelope
  if (!envelope || typeof envelope !== 'object') return 0
  const found = Object.values(envelope as Record<string, unknown>).find(
    (value) => typeof value === 'number',
  )
  return (found as number | undefined) ?? 0
}
