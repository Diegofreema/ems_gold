import type { Notification } from '@/features/notifications/types'

/** Stand-in for `GET /teachers/me/notifications`. */
export const teacherNotifications: Notification[] = [
  { id: 'n1', kicker: 'Assessment', title: 'BAT-1121 was rejected', body: 'The bursary sent back Further Maths SS2 A. Two pupils have no CA score. Fix the file and upload it again.', when: '08:40', group: 'Today', to: '/teacher/uploads' },
  { id: 'n2', kicker: 'Assessment', title: 'Two score sheets are still open', body: 'Mathematics SS1 A and Basic Science JSS2 A close on 05 December.', when: '07:15', group: 'Today', to: '/teacher/scores' },
  { id: 'n3', kicker: 'Teaching', title: 'E-class in one hour', body: 'Quadratics revision clinic, SS1 A, 16:00. Three materials attached.', when: '15:00', group: 'Today', to: '/teacher/eclasses' },
  { id: 'n4', kicker: 'Messages', title: 'The school office replied', body: 'Re: request for a second Further Maths period. The head of department will confirm on Friday.', when: 'Yesterday', group: 'Earlier', to: '/teacher/msg-admin' },
  { id: 'n5', kicker: 'Teaching', title: 'David Ogunleye is at risk', body: 'His Mathematics average has fallen to 41. The pastoral team asks that you record a note this week.', when: '18 Nov', group: 'Earlier', to: '/teacher/students' },
  { id: 'n6', kicker: 'Assessment', title: 'BAT-1142 was approved', body: 'Mathematics SS1 A, 35 scores. The results are now visible to pupils and parents.', when: '17 Nov', group: 'Earlier', to: '/teacher/results' },
]
