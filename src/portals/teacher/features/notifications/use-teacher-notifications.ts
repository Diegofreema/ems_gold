import { useMemo } from 'react'
import {
  useMyResults,
  useMyTeachingDashboard,
} from '@/api/teaching/hooks'
import type { Notification } from '@/features/notifications/types'
import { ALL } from '../../collections/mine'
import { teacherNotices } from './notices'

/**
 * The bell and the notification centre both read this.
 *
 * Both queries are ones the teacher's own pages already make on the same keys,
 * so react-query answers the second caller from the cache rather than the
 * network: the feed costs one dashboard call on a page that is not the
 * dashboard, and nothing at all on one that is.
 */
export function useTeacherNotifications(): Notification[] {
  const dashboard = useMyTeachingDashboard()
  const marks = useMyResults({ limit: ALL })

  return useMemo(
    () => teacherNotices(dashboard.data, marks.data?.items ?? [], new Date()),
    [dashboard.data, marks.data],
  )
}
