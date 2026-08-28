import type { CollectionDef } from '@/features/collections/types'
import { historyTab } from './history'

export const tests: CollectionDef = {
  id: 'tests',
  path: '/student/tests',
  kicker: 'Assessment',
  title: 'Tests open to me',
  description:
    'Computer-based tests set for your arm. Each one can be taken once.',
  action: 'Start the open test',
  actionTo: '/student/test',
  searchHint: 'Search test or subject',
  footer: '5 tests this term',
  emptyTitle: 'No tests set',
  emptyBody: 'Tests appear here when a teacher opens one for your arm.',
  noun: 'test',
  nameKey: 'title',
  tabs: historyTab,
  summary: [
    { label: 'Open now', value: '1' },
    { label: 'Submitted', value: '3' },
    { label: 'Closed, missed', value: '1' },
  ],
  columns: [
    { key: 'title', label: 'Test', cardRole: 'title' },
    { key: 'subject', label: 'Subject', cardRole: 'subtitle' },
    { key: 'questions', label: 'Questions', align: 'right' },
    { key: 'minutes', label: 'Minutes', align: 'right' },
    { key: 'closes', label: 'Closes' },
    { key: 'state', label: 'State', tag: true, cardRole: 'tag' },
  ],
  rows: [
    { id: 't-1', title: 'Quadratic equations quiz', subject: 'Mathematics', questions: '20', minutes: '25', closes: 'Fri 22 Nov', state: 'Open' },
    { id: 't-2', title: 'Cell biology test 2', subject: 'Biology', questions: '15', minutes: '20', closes: 'Mon 18 Nov', state: 'Submitted' },
    { id: 't-3', title: 'Spreadsheet functions', subject: 'Computer Studies', questions: '18', minutes: '20', closes: 'Thu 14 Nov', state: 'Submitted' },
    { id: 't-4', title: 'Comprehension test 3', subject: 'English Language', questions: '25', minutes: '30', closes: 'Fri 08 Nov', state: 'Submitted' },
    { id: 't-5', title: 'Mole concept quiz', subject: 'Chemistry', questions: '15', minutes: '20', closes: 'Wed 06 Nov', state: 'Missed' },
  ],
}

export const results: CollectionDef = {
  id: 'results',
  path: '/student/results',
  kicker: 'Assessment',
  title: 'My results',
  description:
    'Approved results for this term. A subject appears once the bursary approves the batch.',
  action: 'Download result sheet',
  searchHint: 'Search subject',
  footer: '7 of 10 subjects approved',
  emptyTitle: 'No results yet',
  emptyBody:
    'A subject appears here once your teacher submits it and the bursary approves the batch.',
  noun: 'result',
  nameKey: 'subject',
  tabs: historyTab,
  summary: [
    { label: 'Term average', value: '74.2' },
    { label: 'Position in arm', value: '4 of 35' },
    { label: 'Subjects approved', value: '7 of 10' },
  ],
  columns: [
    { key: 'subject', label: 'Subject', cardRole: 'title' },
    { key: 'ca', label: 'CA', align: 'right' },
    { key: 'exam', label: 'Exam', align: 'right' },
    { key: 'total', label: 'Total', align: 'right', cardRole: 'subtitle' },
    { key: 'grade', label: 'Grade', tag: true, cardRole: 'tag' },
    { key: 'position', label: 'Position', align: 'right' },
  ],
  rows: [
    { id: 'r-1', subject: 'Mathematics', ca: '26', exam: '52', total: '78', grade: 'A', position: '3' },
    { id: 'r-2', subject: 'English Language', ca: '24', exam: '48', total: '72', grade: 'B', position: '6' },
    { id: 'r-3', subject: 'Biology', ca: '22', exam: '49', total: '71', grade: 'B', position: '5' },
    { id: 'r-4', subject: 'Computer Studies', ca: '27', exam: '58', total: '85', grade: 'A', position: '1' },
    { id: 'r-5', subject: 'Chemistry', ca: '19', exam: '41', total: '60', grade: 'C', position: '12' },
    { id: 'r-6', subject: 'Physics', ca: '21', exam: '45', total: '66', grade: 'B', position: '8' },
    { id: 'r-7', subject: 'Government', ca: '25', exam: '54', total: '79', grade: 'A', position: '2' },
  ],
}
