import { pageRows } from '@/features/collections/api';
import type { CollectionDef } from '@/features/collections/types';
import { queryClient } from '@/lib/query-client';
import { studentResultsQuery, studentTestsQuery } from '../api/queries';
import { marksOf, resultRows, termAverage } from '../features/results/results';
import { testRows, testTally } from '../features/tests/tests';

/**
 * Every paper set for the pupil's arm, through the cache so the register and
 * the three tiles above it read one answer between them.
 *
 * The rows are not what the paper page reads: opening a test asks
 * `/assignments/{id}` for the questions, which this list does not carry.
 */
const papers = () =>
  queryClient.ensureQueryData(studentTestsQuery).then(testRows);
const tally = () => papers().then(testTally);

export const tests: CollectionDef = {
  id: 'tests',
  path: '/student/tests',
  kicker: 'Assessment',
  title: 'Tests',
  description:
    'Computer-based tests set for your arm, the open ones first. Each one can be taken once — open a test to see its questions.',
  // No button, and no `actionTo`: which paper "Start the open test" would open
  // depends on which of them is open, and a fixed link cannot know. The rows
  // are the way in.
  action: 'Start the open test',
  readonly: true,
  searchHint: 'Search test or subject',
  footer: 'Open first, then what is still to come',
  emptyTitle: 'No tests set',
  emptyBody:
    'Tests appear here when a teacher opens one for your arm. Only papers set for your own class are ever listed.',
  noun: 'test',
  nameKey: 'title',
  // No history: the API keeps no record of a pupil opening a paper, only of
  // submitting one, and that is the state column.
  tabs: [],
  counts: [
    { label: 'Open now', count: () => tally().then((counted) => counted.open) },
    {
      label: 'Submitted',
      count: () => tally().then((counted) => counted.submitted),
    },
    {
      label: 'Closed, missed',
      count: () => tally().then((counted) => counted.missed),
    },
  ],
  columns: [
    { key: 'title', label: 'Test', cardRole: 'title' },
    { key: 'subject', label: 'Subject', cardRole: 'subtitle' },
    { key: 'questions', label: 'Questions', align: 'right' },
    { key: 'minutes', label: 'Minutes', align: 'right' },
    { key: 'closes', label: 'Closes' },
    { key: 'state', label: 'State', tag: true, cardRole: 'tag' },
  ],
  /*
   * Read whole and searched here. The endpoint takes a `subject_id` and
   * nothing else — no search term, no state — and a pupil cannot list the
   * subjects to fill a dropdown with, so the box matches the title, the
   * subject and the state at once instead.
   */
  source: (params) => papers().then((all) => pageRows(all, params)),
  // No `record`: a row opens the paper at `/student/tests/{id}`, which reads
  // the questions the register never asked for.
};

const sheet = () => queryClient.ensureQueryData(studentResultsQuery);

const marks = () => sheet().then((answer) => resultRows(marksOf(answer)));

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
  // No history. The one figure worth a tile is the term average, and it is
  // the API's own — this page never worked one out, because an average over
  // marks from different terms is not a term average. A position needs the
  // class broadsheet, which a pupil login cannot reach.
  tabs: [],
  counts: [
    {
      label: 'Subjects released',
      count: async () => marksOf(await sheet()).length,
    },
    {
      label: 'Term average',
      // Nought is a real average and "not marked yet" is not, so a term with
      // nothing in it reads as a dash rather than as a pupil who scored zero.
      count: async () => termAverage(await sheet()) ?? -1,
      format: (value) => (value < 0 ? '—' : String(Math.round(value * 10) / 10)),
    },
  ],
  columns: [
    { key: 'subject', label: 'Subject', cardRole: 'title' },
    { key: 'term', label: 'Term', cardRole: 'subtitle' },
    { key: 'exam', label: 'Exam', align: 'right' },
    { key: 'total', label: 'Total', align: 'right' },
    { key: 'grade', label: 'Grade', tag: true, cardRole: 'tag' },
  ],
  detail: [
    { key: 'subject', label: 'Subject' },
    { key: 'klass', label: 'Class' },
    { key: 'session', label: 'Session' },
    { key: 'semester', label: 'Term' },
    { key: 'firstCa', label: 'First CA' },
    { key: 'secondCa', label: 'Second CA' },
    { key: 'homework', label: 'Homework / project' },
    { key: 'exam', label: 'Examination' },
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
  record: (recordId) =>
    marks().then((all) => all.find((row) => row.id === recordId)),
};
