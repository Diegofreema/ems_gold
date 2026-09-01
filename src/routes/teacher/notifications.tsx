import { createFileRoute } from '@tanstack/react-router'
import { NotificationsPage } from '@/features/notifications/notifications-page'
import { teacherDashboardQuery } from '@/portals/teacher/api/dashboard'
import { useTeacherFeed } from '@/portals/teacher/features/notifications/use-teacher-notifications'
import { myMarks } from '@/portals/teacher/collections/mine'
import { teacherPortal } from '@/portals/teacher/config'

export const Route = createFileRoute('/teacher/notifications')({
  staticData: { title: 'Notifications', crumb: 'Overview' },
  // Two of the three lists are warmed here, so an empty feed never draws "You
  // are up to date" — a claim, not a spinner — while it is still asking. The
  // notice board is deliberately not among them: it answers 500 on this
  // deployment, and a loader that awaited it would take the shell down with
  // it. It is read in the component instead, where failing costs the board
  // and nothing else.
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(teacherDashboardQuery),
      myMarks(),
    ]),
  component: TeacherNotifications,
})

function TeacherNotifications() {
  const feed = useTeacherFeed()
  return (
    <NotificationsPage
      notifications={feed.notifications}
      boardError={feed.boardError}
      category={teacherPortal.notificationCategory}
      description="Notices from the office, what the office has done with your marks, and the papers you have set. Opening an item takes you to the page it came from."
    />
  )
}
