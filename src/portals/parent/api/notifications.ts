import type { Notification } from '@/features/notifications/types'

/** Stand-in for `GET /parents/me/notifications`. */
export const parentNotifications: Notification[] = [
  { id: 'n1', kicker: 'Finance', title: 'INV-2044 is due on 30 November', body: '₦117,000 is outstanding across both children. Part payments are allowed.', when: '08:00', group: 'Today', to: '/parent/invoices' },
  { id: 'n2', kicker: 'Learning', title: 'Amaka’s Mathematics result is published', body: 'She scored 86 and sits first in a class of thirty-nine.', when: '07:20', group: 'Today', to: '/parent/results' },
  { id: 'n3', kicker: 'Messages', title: 'C. Nnaji sent you a message', body: 'Re: extra Mathematics practice over the mid-term break.', when: 'Yesterday', group: 'Earlier', to: '/parent/children' },
  { id: 'n4', kicker: 'Finance', title: 'Receipt RCT-8841 issued', body: '₦120,000 received by transfer. Keep this for your records.', when: '16 Nov', group: 'Earlier', to: '/parent/receipts' },
  { id: 'n5', kicker: 'School', title: 'Chinedu was absent on 15 November', body: 'The register was marked absent with no reason given. Reply if this was an error.', when: '14 Nov', group: 'Earlier', to: '/parent/attendance' },
]
