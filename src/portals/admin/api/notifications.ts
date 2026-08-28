import type { Notification } from '@/features/notifications/types'

/** Stand-in for `GET /admin/notifications`. */
export const adminNotifications: Notification[] = [
  { id: 'n1', kicker: 'Finance', title: '18 invoices went overdue overnight', body: '₦2.4m across Primary 4 to SS2. The reminder run goes out at 16:00 unless you stop it.', when: '08:05', group: 'Today', to: '/admin/collect' },
  { id: 'n2', kicker: 'Students', title: '37 applicants are waiting on a decision', body: 'Eleven have sat the entrance test. Admissions close on 12 December.', when: '07:30', group: 'Today', to: '/admin/applicants' },
  { id: 'n3', kicker: 'Assessment', title: 'BAT-1121 was rejected by the bursary', body: 'Further Maths SS2 A came back with two missing CA scores. C. Nnaji has been told.', when: 'Yesterday', group: 'Earlier', to: '/admin/results' },
  { id: 'n4', kicker: 'Finance', title: 'A Remita payment could not be matched', body: '₦45,000 received with no invoice reference. Reconcile it or it sits in suspense.', when: '18 Nov', group: 'Earlier', to: '/admin/invoices' },
  { id: 'n5', kicker: 'Staff', title: 'Two staff leave requests need a decision', body: 'Both are for the week of 09 December, which overlaps end-of-term marking.', when: '17 Nov', group: 'Earlier', to: '/admin/staff' },
  { id: 'n6', kicker: 'School', title: 'Term ends in four weeks', body: 'Promotion runs, result approvals and fee rollover all fall due before 20 December.', when: '15 Nov', group: 'Earlier', to: '/admin/settings' },
]
