import { createFileRoute } from '@tanstack/react-router'
import { NotificationsPage } from '@/features/notifications/notifications-page'
import { parentPortal } from '@/portals/parent/config'
import { useParentFeed } from '@/portals/parent/features/notifications/use-parent-notifications'

export const Route = createFileRoute('/parent/notifications')({
  staticData: { title: 'Notifications', crumb: 'Overview' },
  component: ParentNotifications,
})

function ParentNotifications() {
  const feed = useParentFeed()
  return (
    <NotificationsPage
      notifications={feed.notifications}
      boardError={feed.boardError}
      category={parentPortal.notificationCategory}
      description="Notices from the school, the fees raised against your children and the papers set for their classes. Opening an item takes you to the page it came from."
    />
  )
}
