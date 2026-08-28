import type { AdminListPath, CollectionDef, Row } from './types'

const STAFF_COLUMNS: CollectionDef['columns'] = [
  { key: 'staffno', label: 'Staff no.', cardRole: 'subtitle' },
  { key: 'name', label: 'Name', cardRole: 'title' },
  { key: 'role', label: 'Role' },
  { key: 'subjects', label: 'Subjects' },
  { key: 'arms', label: 'Arms' },
  { key: 'status', label: 'Status', tag: true, cardRole: 'tag' },
]

const STAFF_ROWS: Row[] = [
  { id: 'sf-1', staffno: 'STF-014', name: 'Chukwuma Nnaji', role: 'Teacher', subjects: 'Mathematics, Further Maths', arms: 'SS1 A, SS2 A', status: 'Active' },
  { id: 'sf-2', staffno: 'STF-021', name: 'Aisha Mohammed', role: 'Teacher', subjects: 'English Language', arms: 'JSS1 A, JSS1 B', status: 'Active' },
  { id: 'sf-3', staffno: 'STF-003', name: 'Samuel Idowu', role: 'Bursary', subjects: '—', arms: '—', status: 'Active' },
  { id: 'sf-4', staffno: 'STF-047', name: 'Rita Obiora', role: 'Teacher', subjects: 'Biology, Agric. Science', arms: 'SS2 B, SS3 A', status: 'Active' },
  { id: 'sf-5', staffno: 'STF-052', name: 'Peter Akpan', role: 'Teacher', subjects: 'Basic Science', arms: 'Primary 4 A, Primary 5 A', status: 'On leave' },
  { id: 'sf-6', staffno: 'STF-009', name: 'Hauwa Abubakar', role: 'Head of Primary', subjects: 'Verbal Reasoning', arms: 'Primary 6 B', status: 'Active' },
  { id: 'sf-7', staffno: 'STF-061', name: 'Emeka Duru', role: 'ICT', subjects: 'Computer Studies', arms: 'JSS2 A, JSS3 C', status: 'Active' },
  { id: 'sf-8', staffno: 'STF-070', name: 'Grace Ekpo', role: 'Librarian', subjects: '—', arms: '—', status: 'Active' },
  { id: 'sf-9', staffno: 'STF-072', name: 'Ifeoma Nwachukwu', role: 'School nurse', subjects: '—', arms: '—', status: 'Active' },
  { id: 'sf-10', staffno: 'STF-081', name: 'Musa Danladi', role: 'Security', subjects: '—', arms: '—', status: 'Active' },
  { id: 'sf-11', staffno: 'STF-001', name: 'Amaka Okonkwo', role: 'Principal', subjects: '—', arms: '—', status: 'Active' },
]

const OFFICE_ROLES = ['Principal', 'Bursary', 'Head of Primary']

export const staff: CollectionDef = {
  id: 'staff',
  path: '/admin/staff',
  kicker: 'Staff',
  title: 'Manage staff',
  description:
    'Teaching and non-teaching staff, the subjects they carry and their current status.',
  action: 'Add staff member',
  searchHint: 'Search staff name',
  footer: '7 of 128 staff',
  emptyTitle: 'No staff records',
  emptyBody:
    'Add your teaching and non-teaching staff to assign subjects and arms.',
  noun: 'staff member',
  nameKey: 'name',
  columns: STAFF_COLUMNS,
  rows: STAFF_ROWS,
  form: [
    {
      title: 'Staff member',
      fields: [
        { key: 'name', label: 'Full name', required: true, wide: true, placeholder: 'Chukwuma Nnaji' },
        { key: 'staffno', label: 'Staff number', required: true, placeholder: 'STF-014' },
        { key: 'role', label: 'Role', required: true, options: ['Teacher', 'Head of Primary', 'Bursary', 'ICT', 'Administration'] },
        { key: 'email', label: 'Work email', required: true, email: true, placeholder: 'name@netpro.africa' },
        { key: 'status', label: 'Status', options: ['Active', 'On leave', 'Exited'] },
      ],
    },
    {
      title: 'Teaching load',
      fields: [
        { key: 'subjects', label: 'Subjects', wide: true, placeholder: 'Mathematics, Further Maths' },
        { key: 'arms', label: 'Arms', wide: true, placeholder: 'SS1 A, SS2 A', hint: 'Leave empty for non-teaching staff.' },
      ],
    },
  ],
}

/**
 * The three staff sub-routes are filtered views over the same records, so they
 * inherit the base definition's columns, form and delete behaviour.
 */
function staffSlice(
  id: string,
  path: AdminListPath,
  title: string,
  description: string,
  keep: (row: Row) => boolean,
  footerNoun: string,
): CollectionDef {
  const rows = STAFF_ROWS.filter(keep)
  return {
    ...staff,
    id,
    path,
    title,
    description,
    rows,
    footer: `${rows.length} ${footerNoun}`,
    summary: undefined,
  }
}

export const staffAdmin = staffSlice(
  'staff-admin',
  '/admin/staff-admin',
  'Administrators',
  'The people who run the office: the principal, the bursary and the heads of section. These accounts see the admin portal.',
  (row) => OFFICE_ROLES.includes(row.role),
  'administrators',
)

export const staffTeachers = staffSlice(
  'staff-teachers',
  '/admin/staff-teachers',
  'Teachers',
  'Everyone who carries a subject. These accounts see the teacher portal and enter scores.',
  (row) => row.role === 'Teacher',
  'teachers',
)

export const staffOther = staffSlice(
  'staff-other',
  '/admin/staff-other',
  'Other staff',
  'Non-teaching staff — library, ICT, health and security. They hold a staff record but no teaching load.',
  (row) => !OFFICE_ROLES.includes(row.role) && row.role !== 'Teacher',
  'non-teaching staff',
)
