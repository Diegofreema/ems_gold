import { createFileRoute } from '@tanstack/react-router'
import { NotificationsPage } from '@/features/notifications/notifications-page'
import { studentPortal } from '@/portals/student/config'

export const Route = createFileRoute('/student/notifications')({
  staticData: { title: 'Notifications', crumb: 'Overview' },
  component: StudentNotifications,
})

function StudentNotifications() {
  return (
    <NotificationsPage
      notifications={studentPortal.useNotifications()}
      category={studentPortal.notificationCategory}
      description="Results, tests and anything your teachers share, newest first. Opening an item takes you to the page it came from."
    />
  )
}
