import { useMemo } from 'react'
import { useMyResults, useMyTeachingDashboard } from '@/api/teaching/hooks'
import { mergedFeed } from '@/features/notifications/notice-feed'
import type { Notification } from '@/features/notifications/types'
import { useNoticeFeed } from '@/features/notifications/use-notice-feed'
import { ALL } from '../../collections/mine'
import { teacherNotices } from './notices'

/**
 * The bell and the notification centre both read this.
 *
 * Two halves in one order. The derived half is worked out from the teacher's
 * own marks and papers — both queries the teacher's pages already make on the
 * same keys, so react-query answers from the cache and the feed costs one
 * dashboard call on a page that is not the dashboard, and nothing at all on
 * one that is. The other half is the office's notice board, which is the only
 * part anybody wrote by hand.
 *
 * The board failing is not the feed failing: it drops out and the derived half
 * still draws. `boardError` is what the page needs to say so.
 */
export function useTeacherNotifications(): Notification[] {
  return useTeacherFeed().notifications
}

export function useTeacherFeed(): {
  notifications: Notification[]
  boardError: string | null
} {
  const dashboard = useMyTeachingDashboard()
  const marks = useMyResults({ limit: ALL })
  const board = useNoticeFeed()

  const derived = useMemo(
    () => teacherNotices(dashboard.data, marks.data?.items ?? [], new Date()),
    [dashboard.data, marks.data],
  )

  return useMemo(
    () => ({
      notifications: mergedFeed(derived, board.notices),
      boardError: board.error,
    }),
    [derived, board.notices, board.error],
  )
}
