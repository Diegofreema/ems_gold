import type { CollectionDef } from '@/features/collections/types'

const ARMS = ['SS1 A', 'SS2 A', 'SS3 A', 'JSS2 A'] as const
const SUBJECTS = ['Mathematics', 'Further Maths', 'Basic Science'] as const

export const uploads: CollectionDef = {
  id: 'uploads',
  path: '/teacher/uploads',
  kicker: 'Assessment',
  title: 'Upload batches',
  description:
    'Result files you have uploaded, and whether the bursary has approved them.',
  action: 'Upload CSV / XLSX',
  searchHint: 'Search batch or subject',
  footer: '6 batches this term',
  emptyTitle: 'Nothing uploaded yet',
  emptyBody:
    'Upload a CSV or XLSX of scores and the bursary reads every line before approving it.',
  noun: 'batch',
  nameKey: 'batch',
  summary: [
    { label: 'Uploaded', value: '6' },
    { label: 'Approved', value: '3' },
    { label: 'Awaiting approval', value: '2' },
  ],
  columns: [
    { key: 'batch', label: 'Batch', cardRole: 'subtitle' },
    { key: 'file', label: 'File', cardRole: 'title' },
    { key: 'subject', label: 'Subject' },
    { key: 'arm', label: 'Arm' },
    { key: 'scores', label: 'Scores', align: 'right' },
    { key: 'state', label: 'State', tag: true, cardRole: 'tag' },
  ],
  rows: [
    { id: 'BAT-1142', batch: 'BAT-1142', file: 'mth-ss1a-firstterm.xlsx', subject: 'Mathematics', arm: 'SS1 A', scores: '35', state: 'Approved' },
    { id: 'BAT-1121', batch: 'BAT-1121', file: 'fmt-ss2a-firstterm.xlsx', subject: 'Further Maths', arm: 'SS2 A', scores: '18', state: 'Rejected' },
    { id: 'BAT-1118', batch: 'BAT-1118', file: 'mth-ss2a-ca.csv', subject: 'Mathematics', arm: 'SS2 A', scores: '36', state: 'Approved' },
    { id: 'BAT-1109', batch: 'BAT-1109', file: 'bsc-jss2a-ca.csv', subject: 'Basic Science', arm: 'JSS2 A', scores: '42', state: 'Awaiting approval' },
    { id: 'BAT-1104', batch: 'BAT-1104', file: 'mth-ss3a-remedial.csv', subject: 'Mathematics', arm: 'SS3 A', scores: '12', state: 'Awaiting approval' },
    { id: 'BAT-1098', batch: 'BAT-1098', file: 'mth-ss1a-ca.csv', subject: 'Mathematics', arm: 'SS1 A', scores: '35', state: 'Approved' },
  ],
  form: [
    {
      title: 'Batch',
      fields: [
        { key: 'file', label: 'File', required: true, wide: true, placeholder: 'mth-ss1a-firstterm.xlsx' },
        { key: 'subject', label: 'Subject', required: true, options: SUBJECTS },
        { key: 'arm', label: 'Arm', required: true, options: ARMS },
        { key: 'scores', label: 'Scores in file', numeric: true, placeholder: '35' },
        { key: 'batch', label: 'Batch reference', placeholder: 'Generated on upload' },
      ],
    },
  ],
}

export const results: CollectionDef = {
  id: 'results',
  path: '/teacher/results',
  kicker: 'Assessment',
  title: 'Browse results',
  description:
    'Scores you have entered, by pupil. Read-only once a batch is approved.',
  action: 'Export results',
  searchHint: 'Search pupil',
  footer: '7 of 143 records',
  emptyTitle: 'No results yet',
  emptyBody: 'Enter a score sheet or upload a file and the results appear here.',
  noun: 'result',
  nameKey: 'name',
  columns: [
    { key: 'name', label: 'Pupil', cardRole: 'title' },
    { key: 'arm', label: 'Arm', cardRole: 'subtitle' },
    { key: 'subject', label: 'Subject' },
    { key: 'ca', label: 'CA', align: 'right' },
    { key: 'exam', label: 'Exam', align: 'right' },
    { key: 'total', label: 'Total', align: 'right' },
    { key: 'grade', label: 'Grade', tag: true, cardRole: 'tag' },
  ],
  rows: [
    { id: 'tr-1', name: 'Ngozi Eze', arm: 'SS1 A', subject: 'Mathematics', ca: '26', exam: '52', total: '78', grade: 'A' },
    { id: 'tr-2', name: 'Halima Yusuf', arm: 'SS1 A', subject: 'Mathematics', ca: '27', exam: '55', total: '82', grade: 'A' },
    { id: 'tr-3', name: 'Blessing Okoro', arm: 'SS1 A', subject: 'Mathematics', ca: '24', exam: '50', total: '74', grade: 'B' },
    { id: 'tr-4', name: 'Chinedu Udo', arm: 'SS2 A', subject: 'Further Maths', ca: '20', exam: '44', total: '64', grade: 'B' },
    { id: 'tr-5', name: 'Segun Bakare', arm: 'SS2 A', subject: 'Mathematics', ca: '19', exam: '38', total: '57', grade: 'C' },
    { id: 'tr-6', name: 'David Ogunleye', arm: 'SS3 A', subject: 'Mathematics', ca: '14', exam: '27', total: '41', grade: 'D' },
    { id: 'tr-7', name: 'Ibrahim Sani', arm: 'JSS2 A', subject: 'Basic Science', ca: '12', exam: '26', total: '38', grade: 'E' },
  ],
}
