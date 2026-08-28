import type { PortalConfig } from '@/lib/portal'
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
  account: {
    name: 'Amaka Okonkwo',
    line: 'Bursar · Full access',
    initials: 'AO',
  },
  headerStatus: (
    <>
      <div className="uppercase tracking-[0.06em]">2025/2026 · First Term</div>
      <div>Week 9 of 13</div>
    </>
  ),
}
