import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Id } from '../types'
import { noticeKeys } from './keys'
import { noticesService } from './service'
import type { MyNoticeParams, NoticeBody, NoticeEditBody, NoticeListParams } from './types'

/**
 * Reading and writing the school's notice board.
 *
 * Nothing here is wired into a page yet, and nothing here has answered on
 * bronze — every read 500s on an unmigrated column. See the note on `Notice`.
 */

/** Notices addressed to the signed-in caller. */
export function useMyNotices(params: MyNoticeParams = {}) {
  return useQuery({
    queryKey: noticeKeys.mine(params),
    queryFn: () => noticesService.mine(params),
  })
}

/**
 * The bell badge. Polled rather than invalidated, because a notice the office
 * posts while the tab is open is the one worth arriving on its own.
 */
export function useUnreadNoticeCount() {
  return useQuery({
    queryKey: noticeKeys.unread(),
    queryFn: () => noticesService.unreadCount(),
    refetchInterval: 60_000,
  })
}

/**
 * Opens one notice — a read that writes, since fetching it is what marks it
 * read and counts the view. A mutation rather than a query for that reason: a
 * route loader or a cache refetch would silently clear somebody's badge.
 *
 * Silent. The reader asked for the notice and is looking at it; a toast
 * saying so is noise on top of an answer they can already see.
 */
export function useOpenNotice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: Id) => noticesService.read(id),
    onSuccess: (notice) => {
      if (notice) queryClient.setQueryData(noticeKeys.detail(String(notice.id)), notice)
      void queryClient.invalidateQueries({ queryKey: noticeKeys.all })
    },
  })
}

/** Marks one read without opening it. Idempotent, and silent for the same reason. */
export function useMarkNoticeRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: Id) => noticesService.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: noticeKeys.all }),
  })
}

/** Clears the badge. Deliberate enough to be worth confirming out loud. */
export function useMarkAllNoticesRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => noticesService.markAllRead(),
    meta: { success: 'All notices marked as read' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: noticeKeys.all }),
  })
}

/** Every notice the school holds, whoever it was addressed to. The office only. */
export function useNotices(params: NoticeListParams = {}) {
  return useQuery({
    queryKey: noticeKeys.list(params),
    queryFn: () => noticesService.all(params),
  })
}

export function usePostNotice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: NoticeBody) => noticesService.post(body),
    meta: { success: 'Notice posted' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: noticeKeys.all }),
  })
}

export function useEditNotice(id: Id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: NoticeEditBody) => noticesService.edit(id, body),
    meta: { success: 'Notice updated' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: noticeKeys.all }),
  })
}

/** Takes the read-marks with it, so the badge moves for everyone. */
export function useDeleteNotice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: Id) => noticesService.remove(id),
    meta: { success: 'Notice deleted' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: noticeKeys.all }),
  })
}
