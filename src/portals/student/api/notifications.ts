import type { Notification } from '@/features/notifications/types'

/** Stand-in for `GET /students/me/notifications`. */
export const studentNotifications: Notification[] = [
  { id: 'n1', kicker: 'Assessment', title: 'Mathematics result approved', body: 'First Term Mathematics is now on your results page. You scored 78 out of 100.', when: '08:12', group: 'Today', to: '/student/results' },
  { id: 'n2', kicker: 'Assessment', title: 'Computer Studies test closes Friday', body: 'Thirty questions, forty minutes. You can only sit it once.', when: '07:40', group: 'Today', to: '/student/tests' },
  { id: 'n3', kicker: 'Learning', title: 'New material in Biology', body: 'R. Obiora shared “Cell structure diagrams”, 3.4 MB.', when: 'Yesterday', group: 'Earlier', to: '/student/materials' },
  { id: 'n4', kicker: 'Learning', title: 'Timetable changed for Thursday', body: 'Chemistry moves to Lab 2 for the rest of the term.', when: '18 Nov', group: 'Earlier', to: '/student/timetable' },
  { id: 'n5', kicker: 'Finance', title: 'Receipt issued', body: 'Your guardian paid ₦85,000 towards First Term fees. Nothing is outstanding.', when: '16 Nov', group: 'Earlier', to: '/student/invoices' },
]
