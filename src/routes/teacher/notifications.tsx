import { createFileRoute } from '@tanstack/react-router'
import { NotificationsPage } from '@/features/notifications/notifications-page'
import { teacherDashboardQuery } from '@/portals/teacher/api/dashboard'
import { myMarks } from '@/portals/teacher/collections/mine'
import { teacherPortal } from '@/portals/teacher/config'

export const Route = createFileRoute('/teacher/notifications')({
  staticData: { title: 'Notifications', crumb: 'Overview' },
  // The feed is worked out from two lists rather than fetched, so it is empty
  // until both are in hand — and an empty feed draws "You are up to date",
  // which is a claim rather than a spinner. Warmed here, the page never says
  // it while it is still asking.
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(teacherDashboardQuery),
      myMarks(),
    ]),
  component: TeacherNotifications,
})

function TeacherNotifications() {
  return (
    <NotificationsPage
      notifications={teacherPortal.useNotifications()}
      category={teacherPortal.notificationCategory}
      description="What the office has done with your marks, and the papers you have set. Opening an item takes you to the page it came from."
    />
  )
}
