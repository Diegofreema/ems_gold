import type { Pagination } from '../types.ts'

/**
 * The school's notice board, under `/notifications`.
 *
 * **None of these shapes is read off a live answer.** Every read endpoint in
 * this folder answers 500 on bronze today — the controllers are deployed but
 * the table behind them is not migrated:
 *
 * - `/notifications/mine`, `/notifications/unread-count`
 *   → `Unknown column 'Notifications.expiresat' in 'WHERE'`
 * - `/notifications`, `/notifications/{id}`
 *   → `Unknown column 'Notifications.department_id' in 'ON'`
 *
 * So this file is written from the published contract, not from data, and is
 * typed to survive being wrong: `id` is the only field it insists on, and
 * everything else is optional and nullable. Read it back off a live answer
 * before building anything on top of it — the two columns the errors name are
 * exactly the two the contract adds, so the fields most likely to differ are
 * `department_id`, `expiresat` and whatever `scope` is derived from.
 */

/** Who a notice is addressed to. Anything else is refused with 422. */
export type NoticeAudience =
  | 'all'
  | 'students'
  /** One class and that class's guardians — what an automatic notice uses. */
  | 'students_parents'
  | 'teachers'
  | 'parents'

export const NOTICE_AUDIENCES: NoticeAudience[] = [
  'all',
  'students',
  'students_parents',
  'teachers',
  'parents',
]

/** Whole school, or the one class on `department_id`. */
export type NoticeScope = 'school' | 'class'

export type Notice = {
  id: number
  title?: string | null
  body?: string | null
  recipients?: NoticeAudience | null
  /** The class it is limited to. Null is the whole school. */
  department_id?: number | null
  scope?: NoticeScope | null
  /** True where a teacher setting a paper raised it, rather than the office. */
  is_automatic?: boolean | null
  /** Per-caller, so it is on `/notifications/mine` and not on the admin list. */
  is_read?: boolean | null
  /** Counted up each time the notice is opened through `/notifications/{id}`. */
  views?: number | null
  /** ISO datetime after which it stops appearing. Null never expires. */
  expiresat?: string | null
  createdate?: string | null
}

export type MyNoticeParams = {
  /** Defaults to 25 at the server. */
  limit?: number
  /** `1` to leave out everything already read. */
  unread?: 1
}

export type NoticeListParams = {
  /** Defaults to 50 at the server. */
  limit?: number
}

/** What `POST /notifications` takes. `recipients` is the only required field. */
export type NoticeBody = {
  title?: string
  body?: string
  recipients: NoticeAudience
  /** Omit for the whole school. */
  department_id?: number | null
  expiresat?: string | null
}

/**
 * `PUT /notifications/{id}` is a partial update: whatever is left out is left
 * alone, so a form must send only the fields it actually showed.
 */
export type NoticeEditBody = Partial<NoticeBody>

/**
 * What a list endpoint answers with.
 *
 * The key the array sits under is a guess — `notifications` is what the path
 * suggests and no answer has been seen to confirm it — so the service reads
 * the first array in the envelope rather than that name, and the counts the
 * same way. One tolerant reader in one place, so a wrong guess is a one-line
 * fix and never an empty page.
 */
export type NoticeEnvelope = {
  notifications?: Notice[] | null
  pagination?: Pagination | null
  [key: string]: unknown
}
