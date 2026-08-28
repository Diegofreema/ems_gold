import type { CollectionDef } from './types'

export const students: CollectionDef = {
  id: 'students',
  path: '/admin/students',
  kicker: 'Students',
  title: 'Enrolled pupils',
  description:
    'Every enrolled pupil across Primary 1 to SS3. Open a pupil for their record, fees and results.',
  action: 'Enrol a pupil',
  searchHint: 'Search name or admission no.',
  footer: '8 of 1,842 pupils · 2025/2026',
  emptyTitle: 'No pupils on the register',
  emptyBody: 'Enrol your first pupil, or admit one from the applicants list.',
  noun: 'pupil',
  nameKey: 'name',
  summary: [
    { label: 'Enrolled', value: '1,842' },
    { label: 'Primary', value: '968' },
    { label: 'Secondary', value: '874' },
    { label: 'Suspended', value: '6' },
  ],
  columns: [
    { key: 'adm', label: 'Adm. no.', cardRole: 'subtitle' },
    { key: 'name', label: 'Name', cardRole: 'title' },
    { key: 'arm', label: 'Arm' },
    { key: 'parent', label: 'Parent' },
    { key: 'fees', label: 'Fees', tag: true },
    { key: 'status', label: 'Status', tag: true, cardRole: 'tag' },
  ],
  rows: [
    { id: 'st-1', adm: 'NEB/2021/0412', name: 'Chinedu Udo', arm: 'SS2 B', parent: 'Mr. Emmanuel Udo', fees: 'Owing', status: 'Active' },
    { id: 'st-2', adm: 'NEB/2023/1180', name: 'Fatima Bello', arm: 'JSS1 A', parent: 'Alhaji M. Bello', fees: 'Owing', status: 'Active' },
    { id: 'st-3', adm: 'NEB/2024/1503', name: 'Tolu Adeyemi', arm: 'Primary 4 A', parent: 'Mrs. Kemi Adeyemi', fees: 'Part paid', status: 'Active' },
    { id: 'st-4', adm: 'NEB/2022/0871', name: 'Ngozi Eze', arm: 'SS1 A', parent: 'Dr. P. Eze', fees: 'Owing', status: 'Active' },
    { id: 'st-5', adm: 'NEB/2020/0233', name: 'David Ogunleye', arm: 'SS3 A', parent: 'Mr. T. Ogunleye', fees: 'Cleared', status: 'Active' },
    { id: 'st-6', adm: 'NEB/2023/1266', name: 'Amarachi Nwosu', arm: 'Primary 6 B', parent: 'Mrs. J. Nwosu', fees: 'Part paid', status: 'Active' },
    { id: 'st-7', adm: 'NEB/2021/0559', name: 'Ibrahim Sani', arm: 'JSS3 C', parent: 'Mr. A. Sani', fees: 'Owing', status: 'Suspended' },
    { id: 'st-8', adm: 'NEB/2024/1610', name: 'Blessing Okoro', arm: 'Primary 2 A', parent: 'Mrs. G. Okoro', fees: 'Cleared', status: 'Active' },
  ],
  form: [
    {
      title: 'Pupil',
      fields: [
        { key: 'name', label: 'Full name', required: true, wide: true, placeholder: 'Ngozi Chiamaka Eze' },
        { key: 'adm', label: 'Admission number', required: true, placeholder: 'NEB/2025/0001' },
        { key: 'arm', label: 'Class arm', required: true, options: ['Primary 1 A', 'Primary 4 A', 'Primary 6 B', 'JSS1 A', 'JSS3 C', 'SS1 A', 'SS2 B', 'SS3 A'] },
        { key: 'dob', label: 'Date of birth', date: true },
        { key: 'gender', label: 'Gender', options: ['Female', 'Male'] },
      ],
    },
    {
      title: 'Parent and status',
      fields: [
        { key: 'parent', label: 'Parent or guardian', required: true, placeholder: 'Dr. P. Eze' },
        { key: 'phone', label: 'Parent phone', numeric: true, placeholder: '0705 883 1190' },
        { key: 'email', label: 'Parent email', email: true, placeholder: 'parent@example.com' },
        { key: 'status', label: 'Status', options: ['Active', 'Suspended'] },
        { key: 'address', label: 'Home address', multiline: true, wide: true, placeholder: '14 Ogui Road, Enugu' },
      ],
    },
  ],
}

export const applicants: CollectionDef = {
  id: 'applicants',
  path: '/admin/applicants',
  kicker: 'Students',
  title: 'Applicants',
  description:
    'Admission applications for the 2025/2026 session. Review the file, then admit into a class arm or decline.',
  action: 'Add applicant',
  searchHint: 'Search applicant',
  footer: '6 of 37 applications',
  emptyTitle: 'No applications',
  emptyBody:
    'Applications appear here as families submit them through the admission form.',
  noun: 'application',
  nameKey: 'name',
  summary: [
    { label: 'Applications', value: '37' },
    { label: 'Awaiting review', value: '14' },
    { label: 'Admitted', value: '19' },
  ],
  columns: [
    { key: 'ref', label: 'Reference', cardRole: 'subtitle' },
    { key: 'name', label: 'Applicant', cardRole: 'title' },
    { key: 'applying', label: 'Applying to' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'stage', label: 'Stage', tag: true, cardRole: 'tag' },
  ],
  rows: [
    { id: 'ap-1', ref: 'APP-0231', name: 'Zainab Lawal', applying: 'JSS1', submitted: '14 Nov 2025', stage: 'Awaiting review' },
    { id: 'ap-2', ref: 'APP-0229', name: 'Michael Etim', applying: 'Primary 1', submitted: '13 Nov 2025', stage: 'Awaiting review' },
    { id: 'ap-3', ref: 'APP-0224', name: 'Precious Ajayi', applying: 'SS1', submitted: '11 Nov 2025', stage: 'Interview set' },
    { id: 'ap-4', ref: 'APP-0219', name: 'Yusuf Garba', applying: 'JSS2', submitted: '08 Nov 2025', stage: 'Admitted' },
    { id: 'ap-5', ref: 'APP-0214', name: 'Grace Onu', applying: 'Primary 5', submitted: '05 Nov 2025', stage: 'Admitted' },
    { id: 'ap-6', ref: 'APP-0208', name: 'Samuel Idris', applying: 'SS2', submitted: '01 Nov 2025', stage: 'Declined' },
  ],
}

export const attendance: CollectionDef = {
  id: 'attendance',
  path: '/admin/attendance',
  kicker: 'Students',
  title: 'Attendance',
  description:
    'Attendance taken today, arm by arm. Marks are entered by the form teacher and locked at 10:00.',
  action: 'Export CSV',
  searchHint: 'Search arm or teacher',
  footer: '7 arms shown · 19 November 2025',
  emptyTitle: 'No attendance for this date',
  emptyBody:
    'Either the day has not started, or no form teacher has marked a register yet.',
  noun: 'register',
  nameKey: 'arm',
  summary: [
    { label: 'Present today', value: '94%' },
    { label: 'Absent', value: '82 pupils' },
    { label: 'Arms not marked', value: '3' },
  ],
  columns: [
    { key: 'arm', label: 'Arm', cardRole: 'title' },
    { key: 'teacher', label: 'Form teacher', cardRole: 'subtitle' },
    { key: 'roll', label: 'Roll', align: 'right' },
    { key: 'present', label: 'Present', align: 'right' },
    { key: 'rate', label: 'Rate', align: 'right' },
    { key: 'state', label: 'Marking', tag: true, cardRole: 'tag' },
  ],
  rows: [
    { id: 'at-1', arm: 'Primary 1 A', teacher: 'H. Abubakar', roll: '38', present: '37', rate: '97%', state: 'Marked' },
    { id: 'at-2', arm: 'Primary 4 A', teacher: 'P. Akpan', roll: '41', present: '38', rate: '93%', state: 'Marked' },
    { id: 'at-3', arm: 'Primary 6 B', teacher: 'G. Ekpo', roll: '36', present: '30', rate: '83%', state: 'Marked' },
    { id: 'at-4', arm: 'JSS1 A', teacher: 'A. Mohammed', roll: '44', present: '43', rate: '98%', state: 'Marked' },
    { id: 'at-5', arm: 'JSS3 C', teacher: 'E. Duru', roll: '39', present: '—', rate: '—', state: 'Not marked' },
    { id: 'at-6', arm: 'SS1 A', teacher: 'C. Nnaji', roll: '35', present: '34', rate: '97%', state: 'Marked' },
    { id: 'at-7', arm: 'SS3 A', teacher: 'R. Obiora', roll: '31', present: '—', rate: '—', state: 'Not marked' },
  ],
}
