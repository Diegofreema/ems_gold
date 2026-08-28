import type { CollectionDef, Row } from '@/features/collections/types'

const ARMS = ['SS1 A', 'SS2 A', 'SS3 A', 'JSS2 A'] as const
const SUBJECTS = ['Mathematics', 'Further Maths', 'Basic Science'] as const

const SUBJECT_ROWS: Row[] = [
  { id: 'sb-1', code: 'MTH', name: 'Mathematics', arms: 'SS1 A, SS2 A', pupils: '71', periods: '8' },
  { id: 'sb-2', code: 'FMT', name: 'Further Mathematics', arms: 'SS2 A', pupils: '18', periods: '4' },
  { id: 'sb-3', code: 'MTH', name: 'Mathematics (remedial)', arms: 'SS3 A', pupils: '12', periods: '2' },
  { id: 'sb-4', code: 'BSC', name: 'Basic Science', arms: 'JSS2 A', pupils: '42', periods: '3' },
]

export const subjects: CollectionDef = {
  id: 'subjects',
  path: '/teacher/subjects',
  kicker: 'Teaching',
  title: 'My subjects',
  description:
    'The subjects you carry this term and the arms you carry them in.',
  action: 'Request a subject',
  searchHint: 'Search subject',
  footer: '4 subjects · First Term 2025/2026',
  emptyTitle: 'No subjects yet',
  emptyBody:
    'Once the head of department assigns you a subject it appears here.',
  noun: 'subject',
  nameKey: 'name',
  columns: [
    { key: 'code', label: 'Code', cardRole: 'subtitle' },
    { key: 'name', label: 'Subject', cardRole: 'title' },
    { key: 'arms', label: 'Arms' },
    { key: 'pupils', label: 'Pupils', align: 'right' },
    { key: 'periods', label: 'Periods / wk', align: 'right' },
  ],
  rows: SUBJECT_ROWS,
  form: [
    {
      title: 'Subject',
      fields: [
        { key: 'code', label: 'Subject code', required: true, placeholder: 'MTH' },
        { key: 'name', label: 'Subject name', required: true, placeholder: 'Mathematics' },
        { key: 'arms', label: 'Arms', required: true, wide: true, placeholder: 'SS1 A, SS2 A' },
        { key: 'pupils', label: 'Pupils', numeric: true, placeholder: '35' },
        { key: 'periods', label: 'Periods per week', numeric: true, placeholder: '8' },
      ],
    },
    {
      title: 'Why you are requesting it',
      fields: [
        {
          key: 'reason',
          label: 'Note to the head of department',
          multiline: true,
          wide: true,
          placeholder: 'One or two lines the HOD will read.',
        },
      ],
    },
  ],
}

export const students: CollectionDef = {
  id: 'students',
  path: '/teacher/students',
  kicker: 'Teaching',
  title: 'My students',
  description:
    'Every pupil registered to a subject you teach. Open a pupil for their scores in your subjects only.',
  action: 'Export list',
  searchHint: 'Search pupil or admission no.',
  footer: '8 of 143 pupils',
  emptyTitle: 'No pupils registered',
  emptyBody:
    'Pupils appear here once the office registers them to one of your subjects.',
  noun: 'pupil',
  nameKey: 'name',
  summary: [
    { label: 'Pupils', value: '143' },
    { label: 'Arms', value: '4' },
    { label: 'At risk', value: '11' },
  ],
  columns: [
    { key: 'adm', label: 'Adm. no.', cardRole: 'subtitle' },
    { key: 'name', label: 'Name', cardRole: 'title' },
    { key: 'arm', label: 'Arm' },
    { key: 'subject', label: 'Subject' },
    { key: 'avg', label: 'Average', align: 'right' },
    { key: 'standing', label: 'Standing', tag: true, cardRole: 'tag' },
  ],
  rows: [
    { id: 'ts-1', adm: 'NEB/2022/0871', name: 'Ngozi Eze', arm: 'SS1 A', subject: 'Mathematics', avg: '78', standing: 'Strong' },
    { id: 'ts-2', adm: 'NEB/2021/0412', name: 'Chinedu Udo', arm: 'SS2 A', subject: 'Further Maths', avg: '64', standing: 'Steady' },
    { id: 'ts-3', adm: 'NEB/2020/0233', name: 'David Ogunleye', arm: 'SS3 A', subject: 'Mathematics', avg: '41', standing: 'At risk' },
    { id: 'ts-4', adm: 'NEB/2022/0904', name: 'Halima Yusuf', arm: 'SS1 A', subject: 'Mathematics', avg: '82', standing: 'Strong' },
    { id: 'ts-5', adm: 'NEB/2023/1044', name: 'Segun Bakare', arm: 'SS2 A', subject: 'Mathematics', avg: '57', standing: 'Steady' },
    { id: 'ts-6', adm: 'NEB/2023/1180', name: 'Fatima Bello', arm: 'JSS2 A', subject: 'Basic Science', avg: '69', standing: 'Steady' },
    { id: 'ts-7', adm: 'NEB/2021/0559', name: 'Ibrahim Sani', arm: 'JSS2 A', subject: 'Basic Science', avg: '38', standing: 'At risk' },
    { id: 'ts-8', adm: 'NEB/2024/1610', name: 'Blessing Okoro', arm: 'SS1 A', subject: 'Mathematics', avg: '74', standing: 'Strong' },
  ],
}

export const topics: CollectionDef = {
  id: 'topics',
  path: '/teacher/topics',
  kicker: 'Teaching',
  title: 'Topics taught',
  description:
    'A record of what you have covered, week by week. The head of department reads this.',
  action: 'Add topic',
  searchHint: 'Search topic',
  footer: '7 topics recorded this term',
  emptyTitle: 'Nothing recorded yet',
  emptyBody: 'Record what you cover each week so the HOD can follow the scheme.',
  noun: 'topic',
  nameKey: 'topic',
  columns: [
    { key: 'week', label: 'Week', cardRole: 'subtitle' },
    { key: 'topic', label: 'Topic', cardRole: 'title' },
    { key: 'subject', label: 'Subject' },
    { key: 'arm', label: 'Arm' },
    { key: 'state', label: 'State', tag: true, cardRole: 'tag' },
  ],
  rows: [
    { id: 'tp-1', week: 'Week 9', topic: 'Quadratic equations — factorisation', subject: 'Mathematics', arm: 'SS1 A', state: 'In progress' },
    { id: 'tp-2', week: 'Week 8', topic: 'Indices and logarithms', subject: 'Mathematics', arm: 'SS1 A', state: 'Covered' },
    { id: 'tp-3', week: 'Week 8', topic: 'Binomial expansion', subject: 'Further Maths', arm: 'SS2 A', state: 'Covered' },
    { id: 'tp-4', week: 'Week 7', topic: 'Simultaneous equations', subject: 'Mathematics', arm: 'SS2 A', state: 'Covered' },
    { id: 'tp-5', week: 'Week 6', topic: 'Living and non-living things', subject: 'Basic Science', arm: 'JSS2 A', state: 'Covered' },
    { id: 'tp-6', week: 'Week 5', topic: 'Number bases', subject: 'Mathematics', arm: 'SS1 A', state: 'Covered' },
    { id: 'tp-7', week: 'Week 4', topic: 'Sets and Venn diagrams', subject: 'Mathematics', arm: 'SS1 A', state: 'Covered' },
  ],
  form: [
    {
      title: 'What you taught',
      fields: [
        { key: 'week', label: 'Week', required: true, options: ['Week 9', 'Week 8', 'Week 7', 'Week 6'] },
        { key: 'state', label: 'State', required: true, options: ['In progress', 'Covered'] },
        { key: 'topic', label: 'Topic', required: true, wide: true, placeholder: 'Quadratic equations — factorisation' },
        { key: 'subject', label: 'Subject', required: true, options: SUBJECTS },
        { key: 'arm', label: 'Arm', required: true, options: ARMS },
      ],
    },
    {
      title: 'Notes',
      fields: [
        {
          key: 'note',
          label: 'Note for the HOD',
          multiline: true,
          wide: true,
          placeholder: 'Optional. What went well, what needs a second pass.',
        },
      ],
    },
  ],
}

export const eclasses: CollectionDef = {
  id: 'eclasses',
  path: '/teacher/eclasses',
  kicker: 'Teaching',
  title: 'E-classes',
  description:
    'Online sessions you have scheduled, and the materials attached to each.',
  action: 'Schedule an e-class',
  searchHint: 'Search e-class',
  footer: '5 e-classes',
  emptyTitle: 'No e-classes scheduled',
  emptyBody: 'Schedule a session and attach the materials pupils will need.',
  noun: 'e-class',
  nameKey: 'title',
  columns: [
    { key: 'when', label: 'When', cardRole: 'subtitle' },
    { key: 'title', label: 'Title', cardRole: 'title' },
    { key: 'arm', label: 'Arm' },
    { key: 'materials', label: 'Materials', align: 'right' },
    { key: 'state', label: 'State', tag: true, cardRole: 'tag' },
  ],
  rows: [
    { id: 'ec-1', when: 'Thu 21 Nov, 16:00', title: 'Quadratics revision clinic', arm: 'SS1 A', materials: '3', state: 'Scheduled' },
    { id: 'ec-2', when: 'Tue 19 Nov, 16:00', title: 'Binomial expansion drill', arm: 'SS2 A', materials: '2', state: 'Held' },
    { id: 'ec-3', when: 'Thu 14 Nov, 16:00', title: 'Indices past questions', arm: 'SS1 A', materials: '4', state: 'Held' },
    { id: 'ec-4', when: 'Tue 12 Nov, 16:00', title: 'WAEC problem set 2', arm: 'SS3 A', materials: '1', state: 'Held' },
    { id: 'ec-5', when: 'Thu 07 Nov, 16:00', title: 'Cells and tissues', arm: 'JSS2 A', materials: '2', state: 'Cancelled' },
  ],
  form: [
    {
      title: 'Session',
      fields: [
        { key: 'title', label: 'Title', required: true, wide: true, placeholder: 'Quadratics revision clinic' },
        { key: 'when', label: 'When', required: true, placeholder: 'Thu 21 Nov, 16:00' },
        { key: 'arm', label: 'Arm', required: true, options: ARMS },
        { key: 'materials', label: 'Materials attached', numeric: true, placeholder: '3' },
        { key: 'state', label: 'State', options: ['Scheduled', 'Held', 'Cancelled'] },
      ],
    },
    {
      title: 'Invitation',
      fields: [
        {
          key: 'note',
          label: 'Note sent with the invitation',
          multiline: true,
          wide: true,
          placeholder: 'Pupils and parents receive this with the link.',
        },
      ],
    },
  ],
}
