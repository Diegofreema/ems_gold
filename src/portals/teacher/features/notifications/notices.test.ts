import assert from 'node:assert/strict';
import { test } from 'node:test';
import type {
  SetAssignment,
  TeacherDashboard,
  TeacherResult,
} from '../../../../api/teaching/types.ts';
import {
  markGroups,
  noticeGroup,
  noticeWhen,
  teacherNotices,
} from './notices.ts';

/** `GET /teachers/me/results`, id 3, trimmed to the fields the feed reads. */
const MARK: TeacherResult = {
  id: 3,
  student_id: 4,
  regno: 'CUN/2026/4',
  subject_id: 1,
  class_arm_id: 3,
  session_id: 1,
  semester_id: 1,
  ca: '20.00',
  score: '50.00',
  total: '70.00',
  grade: 'B',
  remark: null,
  approval_status: 'pending',
  uploaddate: '2026-08-31T07:46:19+01:00',
  approved_at: null,
  rejection_reason: null,
  session: { id: 1, name: '2024/2025' },
  semester: { id: 1, name: 'First Term' },
  subject: { id: 1, name: 'ENGLISH LANGUAGE', subjectcode: 'EL' },
  department: { id: 1, name: 'JSS 1', deptcode: 'JSS 1' },
};

/** `GET /teachers/me/dashboard`, `recent_assignments[1]`. */
const PAPER: SetAssignment = {
  id: 5,
  title: 'new paper reading',
  details: 'Please read chapters 1,2 and 3',
  subject_id: 1,
  department_id: 1,
  test_type: 'cbt_test',
  status: 'active',
  total_questions: 10,
  time_limit: null,
  passing_score: 40,
  opendate: '2026-08-27T09:52:00+01:00',
  closedate: '2026-08-29T09:52',
  subject: { id: 1, name: 'ENGLISH LANGUAGE', subjectcode: 'EL' },
};

const dashboard = (papers: SetAssignment[]): TeacherDashboard => ({
  stats: {
    my_students: 2,
    total_students: 5,
    my_subjects: 3,
    pending_assignments: 0,
    attendance_taken_today: false,
  },
  recent_assignments: papers,
  class_arms: [],
});

const NOW = new Date('2026-08-31T12:00:00');
const at = (millis: number) => new Date(millis);

test('a whole sheet of marks is one item, not one per pupil', () => {
  const groups = markGroups([
    MARK,
    { ...MARK, id: 4, student_id: 5 },
    { ...MARK, id: 5, student_id: 6 },
  ]);

  assert.equal(groups.length, 1);
  assert.equal(groups[0].count, 3);
  assert.equal(groups[0].subject, 'ENGLISH LANGUAGE');
  assert.equal(groups[0].klass, 'JSS 1');
  assert.equal(groups[0].term, 'First Term · 2024/2025');
});

test('the same subject in two states is two items', () => {
  const groups = markGroups([
    MARK,
    { ...MARK, id: 4, approval_status: 'approved', approved_at: '2026-08-31T09:00:00+01:00' },
  ]);

  assert.deepEqual(
    groups.map((one) => one.state).sort(),
    ['approved', 'pending'],
  );
});

test('an approved sheet is dated by the decision, not the filing', () => {
  const [group] = markGroups([
    {
      ...MARK,
      approval_status: 'approved',
      approved_at: '2026-08-31T09:00:00+01:00',
    },
  ]);

  assert.equal(noticeWhen(group.at, NOW), '09:00');
});

test('a sheet sent back carries the office’s reason', () => {
  const [notice] = teacherNotices(
    undefined,
    [{ ...MARK, approval_status: 'rejected', rejection_reason: 'Two pupils have no CA score.' }],
    NOW,
  );

  assert.equal(notice.title, 'ENGLISH LANGUAGE marks were sent back');
  assert.match(notice.body, /Two pupils have no CA score\./);
  // The score sheet is where a mark is corrected; the register only reads.
  assert.equal(notice.to, '/teacher/scores');
});

test('a sheet finished over two days is dated by its newest mark', () => {
  const [group] = markGroups([
    MARK,
    { ...MARK, id: 4, uploaddate: '2026-08-31T10:26:20+01:00' },
  ]);

  assert.equal(noticeWhen(group.at, NOW), '10:26');
});

test('a paper still open is dated by its opening, one that is over by its close', () => {
  const open = teacherNotices(
    dashboard([{ ...PAPER, closedate: '2026-09-30T09:52' }]),
    [],
    NOW,
  )[0];
  const closed = teacherNotices(dashboard([PAPER]), [], NOW)[0];

  assert.equal(open.title, 'new paper reading is taking submissions');
  assert.equal(open.when, '27 Aug');
  assert.equal(closed.title, 'new paper reading has closed');
  assert.equal(closed.when, '29 Aug');
});

test('the feed is newest first across both sources', () => {
  const notices = teacherNotices(dashboard([PAPER]), [MARK], NOW);

  assert.deepEqual(
    notices.map((one) => one.kicker),
    ['Assessment', 'Teaching'],
  );
});

test('today reads as a clock time, yesterday as a word, older as a day', () => {
  assert.equal(noticeWhen(new Date('2026-08-31T07:46:19').getTime(), NOW), '07:46');
  assert.equal(noticeWhen(new Date('2026-08-30T23:59:00').getTime(), NOW), 'Yesterday');
  assert.equal(noticeWhen(new Date('2026-08-17T13:31:05').getTime(), NOW), '17 Aug');
  // A year of its own, so "17 Aug" cannot read as this one.
  assert.equal(noticeWhen(new Date('2025-08-17T13:31:05').getTime(), NOW), '17 Aug 2025');
});

test('only today’s items head the page', () => {
  assert.equal(noticeGroup(at(NOW.getTime() - 3_600_000).getTime(), NOW), 'Today');
  assert.equal(noticeGroup(new Date('2026-08-30T23:59:00').getTime(), NOW), 'Earlier');
});

test('a mark with no stamp at all is left off a feed ordered by time', () => {
  assert.deepEqual(markGroups([{ ...MARK, uploaddate: null }]), []);
});
