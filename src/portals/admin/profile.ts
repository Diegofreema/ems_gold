import type { ProfileConfig } from '@/features/profile/types'

export const adminProfile: ProfileConfig = {
  initials: 'AO',
  meta: 'Bursar · STF-003 · Full access to Finance, People and School',
  note: 'What the school office holds about you. Changes to your name or staff number have to go through the principal.',
  sessionNote:
    'Signs you out everywhere except this browser. Useful if you have used a shared computer in the office.',
  fields: [
    { key: 'fullname', label: 'Full name', required: true },
    { key: 'staffno', label: 'Staff number', locked: true },
    { key: 'role', label: 'Role', locked: true },
    { key: 'email', label: 'Work email', required: true, email: true },
    { key: 'phone', label: 'Phone', required: true },
    { key: 'office', label: 'Office', required: true },
  ],
  values: {
    fullname: 'Amaka Okonkwo',
    staffno: 'STF-003',
    role: 'Bursar',
    email: 'amaka.okonkwo@netpro.africa',
    phone: '0803 441 9920',
    office: 'Bursary, Block A',
  },
  account: [
    { label: 'Signs in with', value: 'amaka.okonkwo@netpro.africa' },
    { label: 'Last sign-in', value: 'Today, 07:52 · Lagos' },
    { label: 'Password changed', value: '14 Aug 2025' },
    { label: 'Two-step', value: 'Off' },
  ],
  prefs: [
    { label: 'Email me about overdue fees', hint: 'A daily digest at 16:00', on: true },
    { label: 'Email me when a result batch needs approval', hint: 'As it happens', on: true },
    { label: 'SMS for anything marked urgent', hint: 'Charged to the school line', on: false },
  ],
}
