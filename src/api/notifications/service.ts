import { request } from '../client'
import type { Id } from '../types'
import { countIn, noticeIn, noticesIn } from './envelope'
import type {
  MyNoticeParams,
  NoticeBody,
  NoticeEditBody,
  NoticeEnvelope,
  NoticeListParams,
} from './types'

/**
 * The school notice board. Five endpoints any signed-in caller may use, and
 * four the office alone may.
 *
 * Nothing here has been exercised against a live answer: every read 500s on
 * bronze today with an unmigrated column — see the note on `Notice`. The
 * readers in `envelope.ts` are why that is survivable rather than fatal: they
 * take the list, the record and the count out by shape rather than by a key
 * name this folder is only guessing at.
 */

export const noticesService = {
  /** Notices addressed to the caller, newest first, each carrying `is_read`. */
  mine: (params: MyNoticeParams = {}) =>
    request<NoticeEnvelope>('notifications/mine', { query: { ...params } }).then(noticesIn),

  /** Just the badge number. Cheap enough to poll. */
  unreadCount: () => request<unknown>('notifications/unread-count').then(countIn),

  /**
   * One notice. Opening it is what marks it read and counts the view, so this
   * is a GET that writes — never call it to prefetch.
   *
   * A notice addressed to somebody else answers 403, not 404.
   */
  read: (id: Id) => request<NoticeEnvelope>(`notifications/${id}`).then(noticeIn),

  /** Marks one read without fetching it. Idempotent. */
  markRead: (id: Id) => request<unknown>(`notifications/${id}/read`, { method: 'POST' }),

  /** Clears the badge, and answers with how many were newly marked. */
  markAllRead: () =>
    request<unknown>('notifications/read-all', { method: 'POST' }).then(countIn),

  /** Every notice, whoever it was addressed to. The office only. */
  all: (params: NoticeListParams = {}) =>
    request<NoticeEnvelope>('notifications', { query: { ...params } }).then(noticesIn),

  post: (body: NoticeBody) => request<NoticeEnvelope>('notifications', { method: 'POST', body }),

  /** Partial: whatever is left out of `body` is left as it stands. */
  edit: (id: Id, body: NoticeEditBody) =>
    request<NoticeEnvelope>(`notifications/${id}`, { method: 'PUT', body }),

  /** Takes the read-marks with it. There is no undo. */
  remove: (id: Id) => request<unknown>(`notifications/${id}`, { method: 'DELETE' }),
}
