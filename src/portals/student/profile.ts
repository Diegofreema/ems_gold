import type { ProfileConfig } from '@/features/profile/types'

export const studentProfile: ProfileConfig = {
  initials: 'AO',
  meta: 'NEB/2022/0871 · SS1 A · First Term 2025/2026',
  note: 'Your record as the school holds it. Ask the office to correct anything that is wrong — you cannot change your name or class here.',
  sessionNote:
    'Use this if you signed in on a school computer and forgot to sign out.',
  fields: [
    { key: 'fullname', label: 'Full name', locked: true },
    { key: 'adm', label: 'Admission number', locked: true },
    { key: 'arm', label: 'Class', locked: true },
    { key: 'email', label: 'Email', required: true, email: true },
    { key: 'phone', label: 'Phone', required: true },
    { key: 'guardian', label: 'Guardian on record', locked: true },
  ],
  values: {
    fullname: 'Amara Okeke',
    adm: 'NEB/2022/0871',
    arm: 'SS1 A',
    email: 'amara.okeke@pupils.netpro.africa',
    phone: '0812 664 0091',
    guardian: 'Mr & Mrs Okeke',
  },
  account: [
    { label: 'Signs in with', value: 'amara.okeke@pupils.netpro.africa' },
    { label: 'Last sign-in', value: 'Today, 06:58' },
    { label: 'Password changed', value: '11 Sep 2025' },
    { label: 'Guardian access', value: 'Yes — parent portal linked' },
  ],
  prefs: [
    { label: 'Email me when a result is published', hint: 'As it happens', on: true },
    { label: 'Remind me before a test closes', hint: 'The evening before', on: true },
    { label: 'Email me when a teacher shares material', hint: 'A daily digest', on: false },
  ],
}
