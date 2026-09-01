import type { Notification } from '@/features/notifications/types'
import { useOfficeNoticeFeed } from '@/features/notifications/use-notice-feed'

/**
 * The office's bell and notification centre.
 *
 * The school's own notice board, off `GET /notifications` — the list an
 * administrator can actually read. `/notifications/mine` answers an admin
 * with nothing at all, so the office would otherwise never see the notices it
 * had just posted.
 *
 * This used to carry a second half worked out from the audit trail — every
 * record the office had changed, read as an event. It was real data and it
 * read as filler: the trail is already a page of its own at `/admin/logs`,
 * with filters this feed could not offer, and stacking it under the bell
 * buried the notices somebody had actually written. It is gone.
 */
export function useAdminNotifications(): Notification[] {
  return useAdminFeed().notifications
}

export function useAdminFeed(): {
  notifications: Notification[]
  boardError: string | null
} {
  const board = useOfficeNoticeFeed()
  return { notifications: board.notices, boardError: board.error }
}
