import { useMemo } from 'react'
import { useAssignments } from '@/api/assignments/hooks'
import { useMyStudentInvoices, useMyStudentResults } from '@/api/my-schooling/hooks'
import { mergedFeed } from '@/features/notifications/notice-feed'
import type { Notification } from '@/features/notifications/types'
import { useNoticeFeed } from '@/features/notifications/use-notice-feed'
import { studentNotices } from './notices'

/**
 * The bell and the notification centre both read this.
 *
 * Two halves in one order: the school's notice board, which somebody wrote,
 * and the pupil's own records read as the events that produced them. All three
 * record queries are ones the pupil's pages already make on the same keys, so
 * react-query answers from the cache and the feed costs nothing on a page that
 * has already asked.
 *
 * The board failing is not the feed failing: it drops out, the derived half
 * still draws, and `boardError` is what the page needs to say so.
 */
export function useStudentNotifications(): Notification[] {
  return useStudentFeed().notifications
}

export function useStudentFeed(): {
  notifications: Notification[]
  boardError: string | null
} {
  const papers = useAssignments()
  const results = useMyStudentResults()
  const ledger = useMyStudentInvoices()
  const board = useNoticeFeed()

  const derived = useMemo(
    () =>
      studentNotices(
        papers.data ?? [],
        results.data ?? [],
        ledger.data?.invoices ?? [],
        ledger.data?.transactions ?? [],
        new Date(),
      ),
    [papers.data, results.data, ledger.data],
  )

  return useMemo(
    () => ({
      notifications: mergedFeed(derived, board.notices),
      boardError: board.error,
    }),
    [derived, board.notices, board.error],
  )
}
