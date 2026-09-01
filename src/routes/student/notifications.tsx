import { createFileRoute } from '@tanstack/react-router'
import { NotificationsPage } from '@/features/notifications/notifications-page'
import { studentPortal } from '@/portals/student/config'
import { useStudentFeed } from '@/portals/student/features/notifications/use-student-notifications'

export const Route = createFileRoute('/student/notifications')({
  staticData: { title: 'Notifications', crumb: 'Overview' },
  component: StudentNotifications,
})

function StudentNotifications() {
  const feed = useStudentFeed()
  return (
    <NotificationsPage
      notifications={feed.notifications}
      boardError={feed.boardError}
      category={studentPortal.notificationCategory}
      description="Notices from the school, your tests, your results and what the bursary has recorded. Opening an item takes you to the page it came from."
    />
  )
}
