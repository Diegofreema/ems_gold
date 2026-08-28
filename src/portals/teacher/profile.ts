import type { ProfileConfig } from '@/features/profile/types'

export const teacherProfile: ProfileConfig = {
  initials: 'CN',
  meta: 'STF-014 · Mathematics · SS1 A, SS2 A, SS3 A, JSS2 A',
  note: 'What pupils and parents see when they look you up. Your staff number and subjects are set by the head of department.',
  sessionNote:
    'Signs you out of the staff room computers without touching this browser.',
  fields: [
    { key: 'fullname', label: 'Full name', required: true },
    { key: 'staffno', label: 'Staff number', locked: true },
    { key: 'subjects', label: 'Subjects', locked: true },
    { key: 'email', label: 'Work email', required: true, email: true },
    { key: 'phone', label: 'Phone', required: true },
    { key: 'room', label: 'Usual room', required: true },
  ],
  values: {
    fullname: 'Chukwuma Nnaji',
    staffno: 'STF-014',
    subjects: 'Mathematics, Further Maths',
    email: 'c.nnaji@netpro.africa',
    phone: '0806 118 4432',
    room: 'Block B, Rm 4',
  },
  account: [
    { label: 'Signs in with', value: 'c.nnaji@netpro.africa' },
    { label: 'Last sign-in', value: 'Today, 07:14' },
    { label: 'Password changed', value: '02 Sep 2025' },
    { label: 'Two-step', value: 'Off' },
  ],
  prefs: [
    { label: 'Email me when a batch is approved or rejected', hint: 'As it happens', on: true },
    { label: 'Remind me about open score sheets', hint: 'Every Monday morning', on: true },
    { label: 'SMS for e-class changes', hint: 'One hour before the session', on: false },
  ],
}
