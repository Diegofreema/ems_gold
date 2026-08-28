import { Tag } from '@/components/common/tag'
import type { PortalConfig } from '@/lib/portal'
import { studentNotifications } from './api/notifications'
import { studentNav } from './nav'

export const studentPortal: PortalConfig = {
  role: 'student',
  roleLabel: 'Student',
  basePath: '/student',
  nav: studentNav,
  notifications: studentNotifications,
  notificationCategory: 'Assessment',
  account: {
    name: 'Amara Okeke',
    line: 'NEB/2022/0871 · SS1 A',
    initials: 'AO',
  },
  notFoundAudience: 'pupils',
  notFoundLinks: [
    { to: '/student', label: 'Dashboard', hint: 'This week and your scores' },
    { to: '/student/tests', label: 'Tests open to me', hint: 'One closes Friday' },
    { to: '/student/results', label: 'My results', hint: '7 of 10 subjects approved' },
    { to: '/student/materials', label: 'Course materials', hint: '41 shared with you' },
  ],
  context: (
    <div className="border-b-2 border-divider px-4 pt-3.5 pb-3">
      <div className="font-heading text-sm font-extrabold">Amara Okeke</div>
      <div className="mt-0.5 text-[11.5px] text-muted-foreground">
        SS1 A · NEB/2022/0871
      </div>
      <Tag className="mt-2">Fees cleared</Tag>
    </div>
  ),
  headerStatus: (
    <>
      <div className="uppercase tracking-[0.06em]">First Term · Week 9</div>
      <div>Exams begin 02 Dec</div>
    </>
  ),
}
