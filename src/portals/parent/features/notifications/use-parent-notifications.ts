import { useMemo } from 'react'
import { useMyChildrenAssignments, useMyChildrenInvoices } from '@/api/parents/hooks'
import { mergedFeed } from '@/features/notifications/notice-feed'
import type { Notification } from '@/features/notifications/types'
import { useNoticeFeed } from '@/features/notifications/use-notice-feed'
import { INVOICE_SCAN } from '../../api/family'
import { parentNotices } from './notices'

/**
 * The bell and the notification centre both read this.
 *
 * Two halves in one order: the school's notice board, which somebody wrote,
 * and the household's own records read as the events that produced them. The
 * ledger is asked for on the same key the family page uses, so the two
 * collapse into one request rather than pulling the same two hundred invoices
 * twice.
 *
 * The board failing is not the feed failing: it drops out, the derived half
 * still draws, and `boardError` is what the page needs to say so.
 */
export function useParentNotifications(): Notification[] {
  return useParentFeed().notifications
}

export function useParentFeed(): {
  notifications: Notification[]
  boardError: string | null
} {
  const ledger = useMyChildrenInvoices({ limit: INVOICE_SCAN })
  const papers = useMyChildrenAssignments()
  const board = useNoticeFeed()

  const derived = useMemo(
    () => parentNotices(ledger.data?.items ?? [], papers.data ?? [], new Date()),
    [ledger.data, papers.data],
  )

  return useMemo(
    () => ({
      notifications: mergedFeed(derived, board.notices),
      boardError: board.error,
    }),
    [derived, board.notices, board.error],
  )
}
