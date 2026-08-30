import type { PortalConfig } from '@/lib/portal'
import { teacherNotifications } from './api/notifications'
import { teacherNav } from './nav'

export const teacherPortal: PortalConfig = {
  role: 'teacher',
  roleLabel: 'Teacher',
  basePath: '/teacher',
  nav: teacherNav,
  notifications: teacherNotifications,
  notificationCategory: 'Assessment',
  notFoundAudience: 'teachers',
  notFoundLinks: [
    { to: '/teacher', label: 'Dashboard', hint: 'Today’s periods and open sheets' },
    { to: '/teacher/scores', label: 'Enter scores', hint: 'Two sheets still open' },
    { to: '/teacher/students', label: 'My students', hint: '143 pupils across 4 arms' },
    { to: '/teacher/topics', label: 'Topics taught', hint: 'What the office reads' },
  ],
  account: {
    name: 'Chukwuma Nnaji',
    line: 'STF-014 · Mathematics',
    initials: 'CN',
  },
  context: (
    <div className="border-b-2 border-divider px-4 pt-3.5 pb-2.5">
      <div className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
        Marking for
      </div>
      <div className="mt-1 font-heading text-sm font-extrabold">
        First Term · 2025/2026
      </div>
    </div>
  ),
  headerStatus: (
    <>
      <div>Week 9 of 13</div>
      <div>Results due 05 Dec</div>
    </>
  ),
}
