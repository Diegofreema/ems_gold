import { Tag } from '@/components/common/tag'
import type { PortalConfig } from '@/lib/portal'
import { parentNotifications } from './api/notifications'
import { FAMILY_OWING } from './children'
import { ChildBar } from './features/children/child-bar'
import { parentNav } from './nav'

export const parentPortal: PortalConfig = {
  role: 'parent',
  roleLabel: 'Parent',
  basePath: '/parent',
  nav: parentNav,
  notifications: parentNotifications,
  notificationCategory: 'Finance',
  account: {
    name: 'Mr. Emmanuel Udo',
    line: '0803 441 2280 · 2 children',
    initials: 'EU',
  },
  notFoundAudience: 'parents',
  notFoundLinks: [
    { to: '/parent', label: 'Dashboard', hint: 'What needs you today' },
    { to: '/parent/pay', label: 'Pay fees', hint: '₦117,000 outstanding' },
    { to: '/parent/results', label: 'Results', hint: 'This term, by child' },
    { to: '/parent/receipts', label: 'Receipts', hint: 'Every payment that cleared' },
  ],
  context: (
    <div className="border-b-2 border-divider px-4 pt-3.5 pb-3">
      <div className="font-heading text-sm font-extrabold">
        Mr. Emmanuel Udo
      </div>
      <div className="mt-0.5 text-[11.5px] text-muted-foreground">
        0803 441 2280 · 2 children
      </div>
      <Tag variant="accent" className="mt-2">
        ₦{FAMILY_OWING.toLocaleString('en-NG')} owing
      </Tag>
    </div>
  ),
  contextBar: <ChildBar />,
  headerStatus: (
    <>
      <div className="uppercase tracking-[0.06em]">2025/2026 · First Term</div>
      <div>Fees due 30 Nov</div>
    </>
  ),
}
