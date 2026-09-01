import type { MyNoticeParams, NoticeListParams } from './types'

/**
 * `mine` and `unread` are scoped to the token, so no id appears in either.
 * They sit under the same root as the office's list on purpose: posting,
 * editing or deleting a notice changes what a reader sees, and one
 * `invalidateQueries({ queryKey: noticeKeys.all })` covers both sides.
 */
export const noticeKeys = {
  all: ['notices'] as const,
  mine: (params: MyNoticeParams) => [...noticeKeys.all, 'mine', params] as const,
  unread: () => [...noticeKeys.all, 'unread'] as const,
  list: (params: NoticeListParams) => [...noticeKeys.all, 'list', params] as const,
  detail: (id: string) => [...noticeKeys.all, 'detail', id] as const,
}
