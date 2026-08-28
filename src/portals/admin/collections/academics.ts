import type { CollectionDef } from '@/features/collections/types'

export const classes: CollectionDef = {
  id: 'classes',
  path: '/admin/classes',
  kicker: 'Academics',
  title: 'Classes & arms',
  description:
    'Classes and the arms inside them. An arm is one teachable group with a form teacher and a roll.',
  action: 'Create class arm',
  searchHint: 'Search class or arm',
  footer: '8 of 27 arms',
  emptyTitle: 'No class arms',
  emptyBody: 'Create an arm to start assigning pupils and a form teacher.',
  noun: 'class arm',
  nameKey: 'arm',
  summary: [
    { label: 'Classes', value: '12' },
    { label: 'Arms', value: '27' },
    { label: 'Average roll', value: '38' },
  ],
  columns: [
    { key: 'arm', label: 'Arm', cardRole: 'title' },
    { key: 'klass', label: 'Class', cardRole: 'subtitle' },
    { key: 'teacher', label: 'Form teacher' },
    { key: 'roll', label: 'Roll', align: 'right' },
    { key: 'subjects', label: 'Subjects', align: 'right' },
    { key: 'status', label: 'Status', tag: true, cardRole: 'tag' },
  ],
  rows: [
    { id: 'cl-1', arm: 'Primary 1 A', klass: 'Primary 1', teacher: 'H. Abubakar', roll: '38', subjects: '9', status: 'Active' },
    { id: 'cl-2', arm: 'Primary 1 B', klass: 'Primary 1', teacher: 'V. Okeke', roll: '36', subjects: '9', status: 'Active' },
    { id: 'cl-3', arm: 'Primary 4 A', klass: 'Primary 4', teacher: 'P. Akpan', roll: '41', subjects: '11', status: 'Active' },
    { id: 'cl-4', arm: 'Primary 6 B', klass: 'Primary 6', teacher: 'G. Ekpo', roll: '36', subjects: '11', status: 'Active' },
    { id: 'cl-5', arm: 'JSS1 A', klass: 'JSS 1', teacher: 'A. Mohammed', roll: '44', subjects: '13', status: 'Active' },
    { id: 'cl-6', arm: 'JSS3 C', klass: 'JSS 3', teacher: 'E. Duru', roll: '39', subjects: '13', status: 'Active' },
    { id: 'cl-7', arm: 'SS1 A', klass: 'SS 1', teacher: 'C. Nnaji', roll: '35', subjects: '10', status: 'Active' },
    { id: 'cl-8', arm: 'SS3 A', klass: 'SS 3', teacher: 'R. Obiora', roll: '31', subjects: '10', status: 'Active' },
  ],
}

export const subjects: CollectionDef = {
  id: 'subjects',
  path: '/admin/subjects',
  kicker: 'Academics',
  title: 'Subjects',
  description:
    'The subject register, which classes take each subject and who teaches it.',
  action: 'Create subject',
  searchHint: 'Search subject',
  footer: '7 of 34 subjects',
  emptyTitle: 'No subjects yet',
  emptyBody: 'Create a subject before assigning it to classes and teachers.',
  noun: 'subject',
  nameKey: 'name',
  columns: [
    { key: 'code', label: 'Code', cardRole: 'subtitle' },
    { key: 'name', label: 'Subject', cardRole: 'title' },
    { key: 'classes', label: 'Taken by' },
    { key: 'teachers', label: 'Teachers', align: 'right' },
    { key: 'status', label: 'Status', tag: true, cardRole: 'tag' },
  ],
  rows: [
    { id: 'su-1', code: 'MTH', name: 'Mathematics', classes: 'Primary 1 – SS3', teachers: '6', status: 'Active' },
    { id: 'su-2', code: 'ENG', name: 'English Language', classes: 'Primary 1 – SS3', teachers: '7', status: 'Active' },
    { id: 'su-3', code: 'BSC', name: 'Basic Science', classes: 'Primary 4 – JSS3', teachers: '4', status: 'Active' },
    { id: 'su-4', code: 'BIO', name: 'Biology', classes: 'SS1 – SS3', teachers: '2', status: 'Active' },
    { id: 'su-5', code: 'CMP', name: 'Computer Studies', classes: 'JSS1 – SS3', teachers: '2', status: 'Active' },
    { id: 'su-6', code: 'FMT', name: 'Further Mathematics', classes: 'SS2 – SS3', teachers: '1', status: 'Active' },
    { id: 'su-7', code: 'FRN', name: 'French', classes: 'JSS1 – JSS3', teachers: '1', status: 'Inactive' },
  ],
}

export const calendar: CollectionDef = {
  id: 'calendar',
  path: '/admin/calendar',
  kicker: 'Academics',
  title: 'Sessions & terms',
  description:
    'Academic sessions and the terms inside them. One session and one term are active at a time.',
  action: 'Create session',
  searchHint: 'Search session or term',
  footer: '6 records',
  emptyTitle: 'No sessions defined',
  emptyBody: 'Create a session before terms, fees or results can be recorded.',
  noun: 'session',
  nameKey: 'name',
  columns: [
    { key: 'name', label: 'Name', cardRole: 'title' },
    { key: 'type', label: 'Type', cardRole: 'subtitle' },
    { key: 'starts', label: 'Starts' },
    { key: 'ends', label: 'Ends' },
    { key: 'state', label: 'State', tag: true, cardRole: 'tag' },
  ],
  rows: [
    { id: 'ca-1', name: '2025/2026', type: 'Session', starts: '15 Sep 2025', ends: '17 Jul 2026', state: 'Current' },
    { id: 'ca-2', name: 'First Term', type: 'Term', starts: '15 Sep 2025', ends: '12 Dec 2025', state: 'Current' },
    { id: 'ca-3', name: 'Second Term', type: 'Term', starts: '05 Jan 2026', ends: '27 Mar 2026', state: 'Upcoming' },
    { id: 'ca-4', name: 'Third Term', type: 'Term', starts: '20 Apr 2026', ends: '17 Jul 2026', state: 'Upcoming' },
    { id: 'ca-5', name: '2024/2025', type: 'Session', starts: '16 Sep 2024', ends: '18 Jul 2025', state: 'Closed' },
    { id: 'ca-6', name: '2023/2024', type: 'Session', starts: '18 Sep 2023', ends: '19 Jul 2024', state: 'Closed' },
  ],
  form: [
    {
      title: 'Session or term',
      fields: [
        { key: 'name', label: 'Name', required: true, wide: true, placeholder: '2025/2026' },
        { key: 'type', label: 'Type', required: true, options: ['Session', 'Term'] },
        { key: 'starts', label: 'Starts', required: true, date: true },
        { key: 'ends', label: 'Ends', required: true, date: true },
        { key: 'state', label: 'State', options: ['Upcoming', 'Current', 'Closed'] },
      ],
    },
  ],
}

export const results: CollectionDef = {
  id: 'results',
  path: '/admin/results',
  kicker: 'Academics',
  title: 'Results',
  description:
    'Result batches uploaded by teachers this term, with the state of each upload.',
  action: 'Upload results',
  searchHint: 'Search subject or teacher',
  footer: '6 batches · First Term',
  emptyTitle: 'No result batches',
  emptyBody: 'Batches appear here as teachers submit their score sheets.',
  noun: 'batch',
  nameKey: 'batch',
  summary: [
    { label: 'Batches uploaded', value: '48' },
    { label: 'Awaiting approval', value: '6' },
    { label: 'Class average', value: '61.4' },
  ],
  columns: [
    { key: 'batch', label: 'Batch', cardRole: 'title' },
    { key: 'subject', label: 'Subject', cardRole: 'subtitle' },
    { key: 'arm', label: 'Arm' },
    { key: 'teacher', label: 'Uploaded by' },
    { key: 'scores', label: 'Scores', align: 'right' },
    { key: 'state', label: 'State', tag: true, cardRole: 'tag' },
  ],
  rows: [
    { id: 're-1', batch: 'BAT-1142', subject: 'Mathematics', arm: 'SS1 A', teacher: 'C. Nnaji', scores: '35', state: 'Approved' },
    { id: 're-2', batch: 'BAT-1140', subject: 'English Language', arm: 'JSS1 A', teacher: 'A. Mohammed', scores: '44', state: 'Approved' },
    { id: 're-3', batch: 'BAT-1138', subject: 'Biology', arm: 'SS3 A', teacher: 'R. Obiora', scores: '31', state: 'Awaiting approval' },
    { id: 're-4', batch: 'BAT-1135', subject: 'Computer Studies', arm: 'JSS3 C', teacher: 'E. Duru', scores: '39', state: 'Awaiting approval' },
    { id: 're-5', batch: 'BAT-1129', subject: 'Basic Science', arm: 'Primary 4 A', teacher: 'P. Akpan', scores: '41', state: 'Approved' },
    { id: 're-6', batch: 'BAT-1121', subject: 'Further Mathematics', arm: 'SS2 A', teacher: 'C. Nnaji', scores: '18', state: 'Rejected' },
  ],
}
