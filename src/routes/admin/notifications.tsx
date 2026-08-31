import { createFileRoute } from '@tanstack/react-router'
import { NotificationsPage } from '@/features/notifications/notifications-page'
import { adminPortal } from '@/portals/admin/config'

export const Route = createFileRoute('/admin/notifications')({
  staticData: { title: 'Notifications', crumb: 'Overview' },
  component: AdminNotifications,
})

function AdminNotifications() {
  return (
    <NotificationsPage
      notifications={adminPortal.useNotifications()}
      category={adminPortal.notificationCategory}
      description="Everything the office needs to act on, newest first. Opening an item takes you to the page it came from."
    />
  )
}
