import type { AdminListPath, CollectionDef, Row } from './types'

const PARENT_COLUMNS: CollectionDef['columns'] = [
  { key: 'name', label: 'Parent', cardRole: 'title' },
  { key: 'phone', label: 'Phone', cardRole: 'subtitle' },
  { key: 'children', label: 'Children', align: 'right' },
  { key: 'owing', label: 'Owing', align: 'right' },
  { key: 'status', label: 'Status', tag: true, cardRole: 'tag' },
]

const PARENT_ROWS: Row[] = [
  { id: 'pa-1', name: 'Mr. Emmanuel Udo', phone: '0803 441 2280', children: '2', owing: '₦117,000', status: 'Active' },
  { id: 'pa-2', name: 'Mrs. Kemi Adeyemi', phone: '0812 660 7714', children: '1', owing: '₦31,000', status: 'Active' },
  { id: 'pa-3', name: 'Alhaji M. Bello', phone: '0806 219 5502', children: '3', owing: '₦142,500', status: 'Active' },
  { id: 'pa-4', name: 'Dr. P. Eze', phone: '0705 883 1190', children: '1', owing: '₦120,000', status: 'Active' },
  { id: 'pa-5', name: 'Mrs. J. Nwosu', phone: '0818 337 4408', children: '2', owing: '₦18,750', status: 'Active' },
  { id: 'pa-6', name: 'Mr. T. Ogunleye', phone: '0809 552 6631', children: '1', owing: '₦0', status: 'Inactive' },
  { id: 'pa-7', name: 'Mrs. F. Sani', phone: '0807 114 9923', children: '1', owing: '₦45,000', status: 'Invited' },
  { id: 'pa-8', name: 'Mr. B. Okafor', phone: '0816 402 3318', children: '2', owing: '₦0', status: 'Invited' },
]

export const parents: CollectionDef = {
  id: 'parents',
  path: '/admin/parents',
  kicker: 'Parents',
  title: 'All parents',
  description:
    'Parent and guardian accounts, the children linked to them and how much they owe across all their children.',
  action: 'Add parent',
  searchHint: 'Search parent name or phone',
  footer: '6 of 1,204 parents',
  emptyTitle: 'No parent accounts',
  emptyBody:
    'Parent accounts are created when you enrol a pupil, or you can add one directly.',
  noun: 'parent',
  nameKey: 'name',
  columns: PARENT_COLUMNS,
  rows: PARENT_ROWS,
}

/** Filtered views over the same parent records — see `staffSlice`. */
function parentSlice(
  id: string,
  path: AdminListPath,
  title: string,
  description: string,
  keep: (row: Row) => boolean,
  footerNoun: string,
): CollectionDef {
  const rows = PARENT_ROWS.filter(keep)
  return {
    ...parents,
    id,
    path,
    title,
    description,
    rows,
    footer: `${rows.length} ${footerNoun}`,
  }
}

export const parentsOwing = parentSlice(
  'parents-owing',
  '/admin/parents-owing',
  'Parents owing',
  'Guardians with a balance on at least one child. The bursary works this list first.',
  (row) => row.owing !== '₦0',
  'parents owing',
)

export const parentsCleared = parentSlice(
  'parents-cleared',
  '/admin/parents-cleared',
  'Parents cleared',
  'Nothing outstanding across any of their children this term.',
  (row) => row.owing === '₦0',
  'parents cleared',
)

export const parentsInvited = parentSlice(
  'parents-invited',
  '/admin/parents-invited',
  'Not yet signed up',
  'Accounts created with the pupil record, but the guardian has never signed in. Resend the invitation from the record.',
  (row) => row.status === 'Invited',
  'invitations outstanding',
)
