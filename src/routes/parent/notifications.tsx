import { createFileRoute } from '@tanstack/react-router'
import { NotificationsPage } from '@/features/notifications/notifications-page'
import { parentPortal } from '@/portals/parent/config'

export const Route = createFileRoute('/parent/notifications')({
  staticData: { title: 'Notifications', crumb: 'Overview' },
  component: ParentNotifications,
})

function ParentNotifications() {
  return (
    <NotificationsPage
      notifications={parentPortal.notifications}
      category={parentPortal.notificationCategory}
      description="Fees, results and anything the school needs you to see, newest first. Opening an item takes you to the page it came from."
    />
  )
}
