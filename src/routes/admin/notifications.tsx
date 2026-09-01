import { createFileRoute } from '@tanstack/react-router'
import { NotificationsPage } from '@/features/notifications/notifications-page'
import { adminPortal } from '@/portals/admin/config'
import { useAdminFeed } from '@/portals/admin/features/notifications/use-admin-notifications'

export const Route = createFileRoute('/admin/notifications')({
  staticData: { title: 'Notifications', crumb: 'Overview' },
  component: AdminNotifications,
})

function AdminNotifications() {
  const feed = useAdminFeed()
  return (
    <NotificationsPage
      notifications={feed.notifications}
      boardError={feed.boardError}
      category={adminPortal.notificationCategory}
      description="Every notice on the school's board, newest first. What the office has changed is recorded on the activity log instead."
    />
  )
}
