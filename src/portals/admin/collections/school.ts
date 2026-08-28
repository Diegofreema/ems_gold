import type { CollectionDef } from './types'

export const library: CollectionDef = {
  id: 'library',
  path: '/admin/library',
  kicker: 'School',
  title: 'Library',
  description:
    'The catalogue and what is currently on loan. Issue a book to a pupil or record its return.',
  action: 'Add book',
  searchHint: 'Search title, author or ISBN',
  footer: '7 of 2,318 titles',
  emptyTitle: 'The catalogue is empty',
  emptyBody: 'Add your first title to start lending books to pupils.',
  noun: 'title',
  nameKey: 'title',
  summary: [
    { label: 'Titles', value: '2,318' },
    { label: 'On loan', value: '164' },
    { label: 'Overdue', value: '23' },
  ],
  columns: [
    { key: 'isbn', label: 'ISBN', cardRole: 'subtitle' },
    { key: 'title', label: 'Title', cardRole: 'title' },
    { key: 'author', label: 'Author' },
    { key: 'copies', label: 'Copies', align: 'right' },
    { key: 'out', label: 'On loan', align: 'right' },
    { key: 'state', label: 'Availability', tag: true, cardRole: 'tag' },
  ],
  rows: [
    { id: 'li-1', isbn: '978-0435925', title: 'Things Fall Apart', author: 'Chinua Achebe', copies: '40', out: '31', state: 'Available' },
    { id: 'li-2', isbn: '978-9788165', title: 'New General Mathematics 3', author: 'M.F. Macrae', copies: '60', out: '58', state: 'Low stock' },
    { id: 'li-3', isbn: '978-0198569', title: 'Essential Biology for SSS', author: 'M.C. Michael', copies: '35', out: '35', state: 'All out' },
    { id: 'li-4', isbn: '978-9788023', title: 'Basic Science for Primary 4', author: 'F. Adekunle', copies: '48', out: '20', state: 'Available' },
    { id: 'li-5', isbn: '978-0521004', title: 'The Concubine', author: 'Elechi Amadi', copies: '25', out: '9', state: 'Available' },
    { id: 'li-6', isbn: '978-9789117', title: 'Computer Studies for JSS', author: 'H. Olusanya', copies: '30', out: '28', state: 'Low stock' },
    { id: 'li-7', isbn: '978-0435272', title: 'Second Class Citizen', author: 'Buchi Emecheta', copies: '18', out: '4', state: 'Available' },
  ],
  form: [
    {
      title: 'Book',
      fields: [
        { key: 'title', label: 'Title', required: true, wide: true, placeholder: 'Things Fall Apart' },
        { key: 'author', label: 'Author', required: true, placeholder: 'Chinua Achebe' },
        { key: 'isbn', label: 'ISBN', required: true, placeholder: '978-0435925' },
        { key: 'copies', label: 'Copies held', required: true, numeric: true, placeholder: '40' },
        { key: 'shelf', label: 'Shelf', options: ['Fiction', 'Mathematics', 'Sciences', 'Reference', 'Primary'] },
      ],
    },
  ],
}

export const elections: CollectionDef = {
  id: 'elections',
  path: '/admin/elections',
  kicker: 'School',
  title: 'Prefect elections',
  description:
    'Positions open in this session, their candidates and the running vote count. Counts are live while voting is open.',
  action: 'Add position',
  searchHint: 'Search position or candidate',
  footer: '6 positions · 2025/2026',
  emptyTitle: 'No positions open',
  emptyBody: 'Create a position to start nominating candidates for this session.',
  noun: 'position',
  nameKey: 'position',
  summary: [
    { label: 'Positions', value: '6' },
    { label: 'Candidates', value: '17' },
    { label: 'Votes cast', value: '1,388' },
  ],
  columns: [
    { key: 'position', label: 'Position', cardRole: 'title' },
    { key: 'candidates', label: 'Candidates', align: 'right' },
    { key: 'leading', label: 'Leading', cardRole: 'subtitle' },
    { key: 'votes', label: 'Votes', align: 'right' },
    { key: 'state', label: 'State', tag: true, cardRole: 'tag' },
  ],
  rows: [
    { id: 'el-1', position: 'Head Boy', candidates: '4', leading: 'David Ogunleye', votes: '312', state: 'Voting open' },
    { id: 'el-2', position: 'Head Girl', candidates: '3', leading: 'Ngozi Eze', votes: '298', state: 'Voting open' },
    { id: 'el-3', position: 'Sports Prefect', candidates: '4', leading: 'Ibrahim Sani', votes: '241', state: 'Voting open' },
    { id: 'el-4', position: 'Library Prefect', candidates: '2', leading: 'Amarachi Nwosu', votes: '188', state: 'Closed' },
    { id: 'el-5', position: 'Labour Prefect', candidates: '2', leading: 'Segun Bakare', votes: '203', state: 'Closed' },
    { id: 'el-6', position: 'Social Prefect', candidates: '2', leading: 'Halima Yusuf', votes: '146', state: 'Not started' },
  ],
}

export const logs: CollectionDef = {
  id: 'logs',
  path: '/admin/logs',
  kicker: 'School',
  title: 'Activity log',
  description:
    'Every administrative action, who performed it and when. The log cannot be edited.',
  action: 'Export log',
  searchHint: 'Search action or user',
  footer: '7 of 41,208 entries',
  emptyTitle: 'No activity in this range',
  emptyBody: 'Widen the date range or clear the filters to see entries.',
  noun: 'entry',
  nameKey: 'action',
  columns: [
    { key: 'when', label: 'When', cardRole: 'subtitle' },
    { key: 'user', label: 'User' },
    { key: 'type', label: 'Type' },
    { key: 'action', label: 'Action', cardRole: 'title' },
    { key: 'ip', label: 'IP' },
  ],
  rows: [
    { id: 'lo-1', when: '09:42 today', user: 'A. Okonkwo', type: 'Payment', action: 'Recorded ₦95,000 against INV-25088', ip: '102.89.4.17' },
    { id: 'lo-2', when: '09:31 today', user: 'C. Nnaji', type: 'Results', action: 'Uploaded BAT-1142 — Mathematics, SS1 A', ip: '102.89.4.55' },
    { id: 'lo-3', when: '08:58 today', user: 'S. Idowu', type: 'Spending', action: 'Recorded diesel purchase ₦412,000', ip: '102.89.4.22' },
    { id: 'lo-4', when: '17:20 yesterday', user: 'A. Okonkwo', type: 'Fees', action: 'Allocated ICT levy to 4 arms', ip: '102.89.4.17' },
    { id: 'lo-5', when: '16:04 yesterday', user: 'H. Abubakar', type: 'Attendance', action: 'Marked attendance for Primary 1 A', ip: '102.89.4.61' },
    { id: 'lo-6', when: '15:12 yesterday', user: 'A. Okonkwo', type: 'Students', action: 'Suspended NEB/2021/0559', ip: '102.89.4.17' },
    { id: 'lo-7', when: '11:47 yesterday', user: 'E. Duru', type: 'Auth', action: 'Signed in', ip: '102.89.4.90' },
  ],
}
