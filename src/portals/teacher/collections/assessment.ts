import { teachingService } from '@/api/teaching/service'
import { pageRows } from '@/features/collections/api'
import type { CollectionDef, Row } from '@/features/collections/types'
import { termFromResults } from '../term'
import { batchRow, lineRow, parseBatchKey } from './batch-row'
import { myBatches, myMarks, myRoll } from './mine'
import { uploadBody } from './teaching-body'

const batchRows = async (): Promise<Row[]> => (await myBatches()).map(batchRow)

export const uploads: CollectionDef = {
  id: 'uploads',
  path: '/teacher/uploads',
  kicker: 'Assessment',
  title: 'Upload batches',
  description:
    'Result files you have uploaded, and whether the office has approved them. A batch is one subject, one class and one term.',
  action: 'Upload CSV / XLSX',
  searchHint: 'Search subject, class or term',
  footer: 'Grouped by subject, class and term',
  emptyTitle: 'Nothing uploaded yet',
  emptyBody:
    'Upload a spreadsheet of marks and the office reads every line before approving it. Marks entered by hand on the score sheet do not appear here.',
  noun: 'batch',
  nameKey: 'subject',
  columns: [
    { key: 'subject', label: 'Subject', cardRole: 'title' },
    { key: 'klass', label: 'Class', cardRole: 'subtitle' },
    { key: 'term', label: 'Term' },
    { key: 'lines', label: 'Lines', align: 'right' },
    { key: 'state', label: 'State', tag: true, cardRole: 'tag' },
  ],
  detail: [
    { key: 'subject', label: 'Subject' },
    { key: 'klass', label: 'Class' },
    { key: 'term', label: 'Term' },
    { key: 'session', label: 'Session' },
    { key: 'lines', label: 'Lines' },
    { key: 'state', label: 'State' },
    { key: 'uploaded', label: 'Uploaded' },
  ],
  // The endpoint answers whole and takes no search term.
  source: async (params) => pageRows(await batchRows(), params),
  record: async (recordId) =>
    (await batchRows()).find((batch) => batch.id === String(recordId)),
  save: async (values) => {
    const [roll, marks] = await Promise.all([myRoll(), myMarks()])
    const arm = roll.class_arms.find(
      (one) => String(one.id) === String(values.class_arm_id),
    )
    return teachingService.uploadResults(
      uploadBody(values, arm, termFromResults(marks.items)),
    )
  },
  // Nothing withdraws a batch once it is with the office; a corrected file is
  // uploaded over it.
  form: [
    {
      title: 'The file',
      fields: [
        {
          key: 'result',
          label: 'Results spreadsheet',
          required: true,
          wide: true,
          file: '.csv,.xls,.xlsx',
          hint: 'Column A the admission number, B the CA, then C, D and E the three exam scores. The batch lands with the office as pending.',
        },
        {
          key: 'subject_id',
          label: 'Subject',
          required: true,
          optionsFrom: 'my-subjects',
        },
        {
          key: 'class_arm_id',
          label: 'Arm',
          required: true,
          optionsFrom: 'my-arms',
          hint: 'The class comes with the arm. The term is the one your marks are already filed into.',
        },
      ],
    },
  ],
  tabs: [
    {
      label: 'Lines',
      columns: [
        { key: 'pupil', label: 'Pupil' },
        { key: 'adm', label: 'Adm. no.' },
        { key: 'ca', label: 'CA', align: 'right' },
        { key: 'exam', label: 'Exam', align: 'right' },
        { key: 'total', label: 'Total', align: 'right' },
        { key: 'grade', label: 'Grade' },
        { key: 'state', label: 'State', tag: true },
      ],
      source: async (recordId) => {
        const key = parseBatchKey(recordId)
        if (!key) return []
        return (await teachingService.uploadBatch(key)).map(lineRow)
      },
      empty: 'The office reads this batch line by line; nothing has come back for it yet.',
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
