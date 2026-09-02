import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { ChildAssignment, ChildAssignmentPaper } from '../../../../api/parents/types.ts'
import { assignmentRow, assignmentState, childPapers } from './assignments.ts'

/** The paper as `sparents/my-assignments` sends it. */
const PAPER: ChildAssignmentPaper = {
  setassignment_id: 5,
  title: 'new paper reading',
  subject: 'ENGLISH LANGUAGE',
  time_limit: null,
  opendate: '2026-08-27T09:52:00+00:00',
  closedate: '2026-08-29T09:52',
  status: 'available',
  assignment_id: null,
}

const OPEN_DAY = new Date('2026-08-28T08:00:00')
const AFTER_CLOSING = new Date('2026-08-30T08:00:00')

test('a paper still open reads as available', () => {
  assert.equal(assignmentState(PAPER, OPEN_DAY), 'Available')
})

test('a paper the API still calls available reads as closed once it has', () => {
  // The endpoint does not re-check the clock when it answers: this paper shut
  // on the 29th and is asked for on the 30th.
  assert.equal(assignmentState(PAPER, AFTER_CLOSING), 'Closed')
})

test('the state the child reached is the API own word, whatever it is', () => {
  const sat = { ...PAPER, status: 'completed', assignment_id: 17 }
  // Past its closing time, and still completed — sitting it is the later fact.
  assert.equal(assignmentState(sat, AFTER_CLOSING), 'Completed')
  assert.equal(assignmentState({ ...PAPER, status: 'graded' }, OPEN_DAY), 'Graded')
  assert.equal(assignmentState({ ...PAPER, status: '' }, OPEN_DAY), '—')
})

test('a paper with no closing time stays open rather than reading closed', () => {
  assert.equal(assignmentState({ ...PAPER, closedate: null }, AFTER_CLOSING), 'Available')
})

test('a row is named by the paper, so an unsat test still has an id', () => {
  const row = assignmentRow(PAPER, OPEN_DAY)
  assert.equal(row.id, '5')
  assert.equal(row.title, 'new paper reading')
  assert.equal(row.subject, 'ENGLISH LANGUAGE')
  assert.equal(row.limit, 'No limit')
  assert.equal(assignmentRow({ ...PAPER, time_limit: 45 }, OPEN_DAY).limit, '45 minutes')
})

test('both stamps read on the school clock, whatever offset they carry', () => {
  const row = assignmentRow(PAPER, OPEN_DAY)
  // `opendate` says +00:00 and `closedate` says nothing at all; both are 09:52
  // where the school is, and neither is shifted an hour.
  assert.match(row.opens, /27 Aug 2026, 09:52/)
  assert.match(row.closes, /29 Aug 2026, 09:52/)
})

test('the register picks its own child out of the household', () => {
  const household = [
    { student: { id: 7 }, assignments: [PAPER] },
    { student: { id: 8 }, assignments: [{ ...PAPER, status: 'completed', assignment_id: 17 }] },
  ] as ChildAssignment[]

  assert.deepEqual(
    childPapers(household, 8, OPEN_DAY).map((row) => row.state),
    ['Completed'],
  )
  // A child whose class has nothing set is not an error.
  assert.deepEqual(childPapers(household, 16, OPEN_DAY), [])
})
