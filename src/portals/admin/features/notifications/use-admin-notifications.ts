import { useMemo } from 'react'
import { useActivityLogs } from '@/api/logs/hooks'
import { mergedFeed } from '@/features/notifications/notice-feed'
import type { Notification } from '@/features/notifications/types'
import { useNoticeFeed } from '@/features/notifications/use-notice-feed'
import { adminNotices, LOG_SCAN } from './notices'

/**
 * The bell and the notification centre both read this.
 *
 * Two halves in one order: the school's notice board, which somebody wrote,
 * and the audit trail read as what the office has been doing. The trail is a
 * page longer than the feed shows, because sign-ins are dropped after the
 * fetch and would otherwise crowd everything else out.
 *
 * The board failing is not the feed failing: it drops out, the trail still
 * draws, and `boardError` is what the page needs to say so.
 */
export function useAdminNotifications(): Notification[] {
  return useAdminFeed().notifications
}

export function useAdminFeed(): {
  notifications: Notification[]
  boardError: string | null
} {
  const logs = useActivityLogs({ limit: LOG_SCAN })
  const board = useNoticeFeed()

  const derived = useMemo(
    () => adminNotices(logs.data?.items ?? [], new Date()),
    [logs.data],
  )

  return useMemo(
    () => ({
      notifications: mergedFeed(derived, board.notices),
      boardError: board.error,
    }),
    [derived, board.notices, board.error],
  )
}
