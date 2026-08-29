import type { PortalConfig } from '@/lib/portal'
import { CurrentTerm } from './components/current-term'
import { adminNotifications } from './api/notifications'
import { adminNav } from './nav'

export const adminPortal: PortalConfig = {
  role: 'admin',
  roleLabel: 'Bronze · Admin',
  basePath: '/admin',
  nav: adminNav,
  searchableNav: true,
  notifications: adminNotifications,
  notificationCategory: 'Finance',
  notFoundAudience: 'the office',
  notFoundLinks: [
    { to: '/admin', label: 'Dashboard', hint: 'Money and people at a glance' },
    { to: '/admin/collect', label: 'Fee collection', hint: 'Outstanding invoices' },
    { to: '/admin/students', label: 'Student register', hint: '1,842 pupils' },
    { to: '/admin/logs', label: 'Activity log', hint: 'Who did what' },
  ],
  account: {
    name: 'Amaka Okonkwo',
    line: 'Bursar · Full access',
    initials: 'AO',
  },
  headerStatus: <CurrentTerm />,
}
