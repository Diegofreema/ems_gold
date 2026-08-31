import { pageRows } from '@/features/collections/api'
import type { CollectionDef } from '@/features/collections/types'
import { queryClient } from '@/lib/query-client'
import { studentResultsQuery } from '../api/queries'
import { resultRows } from '../features/results/results'
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

const marks = () =>
  queryClient.ensureQueryData(studentResultsQuery).then((all) => resultRows(all))

export const results: CollectionDef = {
  id: 'results',
  path: '/student/results',
  kicker: 'Assessment',
  title: 'My results',
  description:
    'Every mark the office has approved for you, newest term first. A subject appears once your teacher has filed it and the office has approved the batch it came in.',
  // No button. The design's was "Download result sheet", and a pupil login can
  // reach no result sheet — nor any endpoint that would rank one.
  action: 'Download result sheet',
  readonly: true,
  searchHint: 'Search subject, term or grade',
  footer: 'Approved marks only, across every term',
  emptyTitle: 'No results yet',
  emptyBody:
    'A subject appears here once your teacher has filed the mark and the office has approved the batch it came in. A mark still waiting on either is never sent.',
  noun: 'result',
  nameKey: 'subject',
  // No history, and no tiles. An average over marks from different terms is
  // not a term average, and a position needs a ranking this API does not keep.
  tabs: [],
  columns: [
    { key: 'subject', label: 'Subject', cardRole: 'title' },
    { key: 'term', label: 'Term', cardRole: 'subtitle' },
    { key: 'ca', label: 'CA', align: 'right' },
    { key: 'exam', label: 'Exam', align: 'right' },
    { key: 'total', label: 'Total', align: 'right' },
    { key: 'grade', label: 'Grade', tag: true, cardRole: 'tag' },
  ],
  detail: [
    { key: 'subject', label: 'Subject' },
    { key: 'klass', label: 'Class' },
    { key: 'session', label: 'Session' },
    { key: 'semester', label: 'Term' },
    { key: 'ca', label: 'CA' },
    { key: 'exam', label: 'Exam' },
    { key: 'total', label: 'Total' },
    { key: 'grade', label: 'Grade' },
    { key: 'remark', label: 'Remark' },
    { key: 'filed', label: 'Filed on' },
  ],
  /*
   * Read whole and searched here. The endpoint takes a session and a term, and
   * a pupil cannot name either of them — `/sessions` and `/semesters` are shut
   * to a pupil login — so a dropdown would have nothing to put in it. The box
   * matches the subject, the term and the grade at once instead.
   */
  source: (params) => marks().then((all) => pageRows(all, params)),
  record: (recordId) => marks().then((all) => all.find((row) => row.id === recordId)),
}
