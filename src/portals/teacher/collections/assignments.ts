import type { Assignment, AssignmentBody } from '@/api/set-assignments/types';
import { heldRows } from '@/db/collection';
import { setAssignments, setQuestions, setSubmissions } from '@/db/collections/set-assignments';
import { enqueue } from '@/db/drain';
import { SET, WRITE } from '@/db/ids';
import { DRAWN_STATES, isLocalKey, newLocalKey, type OutboxOp } from '@/db/outbox';
import { outbox } from '@/db/store';
import { BLANK } from '@/features/collections/blank';
import { localFirst } from '@/features/collections/local-first';
import type { CollectionDef, Row } from '@/features/collections/types';
import { submissionRows } from '../features/assignments/marking';
import { correctAnswer, typeLabel } from '../features/assignments/question';
import { assignmentBody } from './assignment-body';
import { assignmentRows, assignmentTally } from './assignment-row';

/**
 * The register reads the device's own set — `setAssignments` in
 * `src/db/collections/set-assignments.ts` — and every write goes through the
 * queue, so an assignment can be set, corrected and deleted with no
 * connection at all. The questions and submissions the record's tabs show
 * come off their own sets the same way.
 */

const mine = async () => assignmentRows(await heldRows(setAssignments));

const tally = () => mine().then(assignmentTally);

/** The assignment's questions, as the record panel's tab lists them. */
const questionRows = async (assignmentId: string): Promise<Row[]> => {
  const questions = (await heldRows(setQuestions)).filter(
    (question) => String(question.assignment_id) === assignmentId,
  );

  return questions.map((question, index) => ({
    id: String(question.id),
    n: String(question.order_number ?? index + 1),
    question: question.question_text?.trim() || `Question ${question.id}`,
    type: typeLabel(question.question_type),
    points: String(question.points ?? 0),
    answer: correctAnswer(question) ?? BLANK,
  }));
};

/**
 * Assignments set on this device that the school has not seen yet. The
 * subject and class are ids in the queued body and their names are not worth
 * a lookup slot here — the title is what the teacher is looking for. A
 * `local:` id is what withholds edit, delete and the questions link until the
 * school issues a real one.
 */
function queuedAssignments(ops: readonly OutboxOp[]): Row[] {
  return ops
    .filter(
      (op) =>
        op.handler === WRITE.createAssignment &&
        DRAWN_STATES.includes(op.state) &&
        typeof op.targetKey === 'string',
    )
    .sort((one, two) => two.seq - one.seq)
    .map((op) => {
      const body = op.payload as AssignmentBody;
      return {
        id: op.targetKey as string,
        title: body.title?.trim() || 'Untitled assignment',
        subject: BLANK,
        klass: BLANK,
        questions: '0',
        closes: BLANK,
        state: 'Waiting to send',
        details: body.details ?? '',
        term: BLANK,
        minutes: body.time_limit ? `${body.time_limit} minutes` : 'No limit',
        pass: body.passing_score == null ? BLANK : `${body.passing_score}%`,
        opens: BLANK,
      };
    });
}

export const assignments: CollectionDef = {
  id: 'assignments',
  path: '/teacher/assignments',
  kicker: 'Assessment',
  title: 'Set assignments',
  description:
    'The assignments you have set, and what each one still needs. Students answer in their own portal once an assignment holds questions and its window opens, and what they send back comes here to be marked.',
  action: 'Set an assignment',
  searchHint: 'Search assignment, subject or class',
  footer: 'What still needs questions first',
  emptyTitle: 'No assignments set yet',
  emptyBody:
    'Set an assignment for one of your classes, then write its questions. Only the class you set it for ever sees it.',
  noun: 'assignment',
  nameKey: 'title',
  counts: [
    {
      label: 'Assignments set',
      count: () => tally().then((counted) => counted.assignments),
    },
    { label: 'Open now', count: () => tally().then((counted) => counted.open) },
    {
      label: 'Awaiting questions',
      count: () => tally().then((counted) => counted.unwritten),
    },
  ],
  columns: [
    { key: 'title', label: 'Assignment', cardRole: 'title' },
    { key: 'subject', label: 'Subject', cardRole: 'subtitle' },
    { key: 'klass', label: 'Class' },
    { key: 'questions', label: 'Questions', align: 'right' },
    { key: 'closes', label: 'Closes' },
    { key: 'state', label: 'State', tag: true, cardRole: 'tag' },
  ],
  detail: [
    { key: 'title', label: 'Assignment' },
    { key: 'details', label: 'Instructions', rich: true },
    { key: 'subject', label: 'Subject' },
    { key: 'klass', label: 'Class' },
    { key: 'term', label: 'Term' },
    { key: 'questions', label: 'Questions' },
    { key: 'minutes', label: 'Time allowed' },
    { key: 'pass', label: 'Pass mark' },
    { key: 'opens', label: 'Opens' },
    { key: 'closes', label: 'Closes' },
    { key: 'state', label: 'State' },
  ],
  // Writing the questions is a page of its own — a question carries its own
  // choices and its own answer key, which is not a row of a record form.
  // Withheld while the assignment is still queued: a question names the
  // assignment's id, and the school has not issued one yet — one rule instead
  // of a dependency graph, as everywhere else.
  rowLink: {
    label: (row) => (isLocalKey(row.id) ? undefined : 'Questions'),
    to: '/teacher/questions',
    search: (row) => ({ assignment: row.id }),
  },
  tabs: [
    {
      label: 'Questions',
      columns: [
        { key: 'n', label: '#', align: 'right' },
        { key: 'question', label: 'Question' },
        { key: 'type', label: 'Kind' },
        { key: 'points', label: 'Points', align: 'right' },
        { key: 'answer', label: 'Answer' },
      ],
      source: questionRows,
      empty:
        'This assignment holds no questions yet, so no student can sit it. Write them before its window opens.',
    },
    {
      label: 'Submissions',
      columns: [
        { key: 'name', label: 'Student' },
        { key: 'adm', label: 'Adm. no.' },
        { key: 'submitted', label: 'Submitted' },
        { key: 'score', label: 'Score', align: 'right' },
        { key: 'state', label: 'State', tag: true },
      ],
      source: async (recordId) =>
        submissionRows(
          (await heldRows(setSubmissions)).find((doc) => String(doc.id) === recordId)
            ?.submissions ?? [],
        ),
      empty:
        'No student has submitted this assignment yet. Answers appear here as they send them in.',
      // The marking itself is its own page: a written answer is read and given
      // a figure, which is not something a row of a table can be. The row still
      // leads straight to that page with the script already open — the teacher
      // has picked their student by clicking them, and making them pick the
      // same student again on the next page was two clicks that decided nothing.
      rowTo: (recordId, row) => ({
        to: '/teacher/submissions',
        search: { assignment: recordId, submission: row.id },
      }),
      action: (recordId) => ({
        label: 'Mark them all',
        to: '/teacher/submissions',
        search: { assignment: recordId },
      }),
    },
  ],
  collection: localFirst({
    entities: setAssignments,
    // `assignmentRows` sorts for itself — unwritten first, then by newness —
    // which is the order the footer promises; a collection alone would hand
    // the rows back in key order.
    rows: (items: Assignment[]) => assignmentRows(items),
    queued: queuedAssignments,
  }),
  record: async (recordId) => {
    if (isLocalKey(recordId)) {
      return queuedAssignments(outbox().toArray).find((row) => row.id === recordId);
    }
    return (await mine()).find((row) => row.id === recordId);
  },
  queue: async (values, recordId) => {
    if (recordId) {
      // The update body carries a status, and nothing in this portal sets one:
      // the assignment's own is sent back rather than a guess at what it
      // should be — read off the device, which is what lets the correction be
      // queued at all.
      const current = (await heldRows(setAssignments)).find(
        (assignment) => String(assignment.id) === recordId,
      );
      enqueue({
        handler: WRITE.updateAssignment,
        payload: { id: recordId, body: assignmentBody(values, current?.status ?? undefined) },
        collectionId: SET.teachingAssignments,
        targetKey: recordId,
        toast: { success: 'Assignment saved' },
        label: `Assignment “${String(values.title ?? '').trim() || recordId}”`,
      });
      return;
    }
    enqueue({
      handler: WRITE.createAssignment,
      payload: assignmentBody(values),
      collectionId: SET.teachingAssignments,
      targetKey: newLocalKey(),
      toast: { success: 'Assignment set' },
      label: `Assignment “${String(values.title ?? '').trim() || 'Untitled'}”`,
    });
  },
  queueRemove: (recordId) =>
    enqueue({
      handler: WRITE.removeAssignment,
      payload: recordId,
      collectionId: SET.teachingAssignments,
      targetKey: recordId,
      toast: { success: 'Assignment deleted' },
      label: 'An assignment',
    }),
  removeBody: (row) =>
    `The assignment and its ${row.questions} question${row.questions === '1' ? '' : 's'} go with it. An assignment students have already sat is better left to close than deleted.`,
  form: [
    {
      title: 'The assignment',
      fields: [
        {
          key: 'title',
          label: 'Title',
          required: true,
          wide: true,
          placeholder: 'Mid-term test',
        },
        {
          key: 'details',
          label: 'Instructions',
          rich: true,
          placeholder:
            'Answer all questions. Headings, lists and emphasis are all kept.',
          hint: 'Read by the class before they start.',
        },
        {
          key: 'subject_id',
          label: 'Subject',
          required: true,
          optionsFrom: 'my-subjects',
          hint: 'One of your own subjects.',
        },
        {
          key: 'department_id',
          label: 'Class',
          required: true,
          optionsFrom: 'my-classes',
          hint: 'Who sits it. Every student of the class sees the assignment; no other class does.',
        },
      ],
    },
    {
      title: 'How it is sat',
      fields: [
        {
          key: 'time_limit',
          label: 'Time allowed (minutes)',
          number: true,
          min: 1,
          hint: 'From the moment a student starts. Leave blank for no limit.',
        },
        {
          key: 'passing_score',
          label: 'Pass mark (%)',
          number: true,
          min: 0,
          max: 100,
          hint: 'A percentage of the marks going, so never more than 100.',
        },
      ],
    },
  ],
};
