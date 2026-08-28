import { createFileRoute } from '@tanstack/react-router'
import { NotificationsPage } from '@/features/notifications/notifications-page'
import { teacherPortal } from '@/portals/teacher/config'

export const Route = createFileRoute('/teacher/notifications')({
  staticData: { title: 'Notifications', crumb: 'Overview' },
  component: TeacherNotifications,
})

function TeacherNotifications() {
  return (
    <NotificationsPage
      notifications={teacherPortal.notifications}
      category={teacherPortal.notificationCategory}
      description="Marking, e-classes and replies from the office, newest first. Opening an item takes you to the page it came from."
    />
  )
}
