import assert from 'node:assert/strict'
import { test } from 'node:test'
import type {
  ChildAssignment,
  ChildAssignmentPaper,
  FamilyInvoice,
} from '../../../../api/parents/types.ts'
import { parentNotices } from './notices.ts'

/**
 * `sparents/my-invoices` as the household sees it — the pupil's whole name is
 * on the bill, and `createdate` carries `+00:00` where every other endpoint
 * stamps the same wall clock `+01:00`.
 */
const BILL: FamilyInvoice = {
  id: 2453,
  student_id: 24,
  student: 'Diego Freeman',
  fee: 'Meidcal FEE',
  session: '2024/2025',
  amount: '20000',
  paystatus: 'success',
  payday: '2026-08-31 08:37:23',
  createdate: '2026-08-31T07:35:40+00:00',
}

const PAPER: ChildAssignmentPaper = {
  setassignment_id: 6,
  title: 'Simple additions',
  subject: 'MATHEMATICS',
  time_limit: null,
  opendate: '2026-08-27T10:03:00+01:00',
  closedate: '2026-08-28T10:08',
  status: 'available',
  assignment_id: null,
}

const HOUSEHOLD: ChildAssignment = {
  student: {
    id: 24,
    regno: 'CUN/2026/24',
    fname: 'Diego',
    lname: 'Freeman',
    mname: null,
    gender: 'Male',
    studentstatus: null,
    department_id: 1,
    department: 'JSS 1',
    class_arm: 'B',
  },
  assignments: [PAPER],
}

const NOW = new Date(2026, 8, 1, 14, 30)

test('a bill and the day it was settled are two events', () => {
  const items = parentNotices([BILL], [], NOW)
  assert.deepEqual(
    items.map((item) => [item.id, item.title, item.when]),
    [
      ['settled-2453', '₦20,000 was received', 'Yesterday'],
      ['bill-2453', '₦20,000 was billed for Diego Freeman', 'Yesterday'],
    ],
  )
  // Settled at 08:37 and raised at 07:35, so the payment heads the pair — the
  // `+00:00` on `createdate` is dropped rather than believed, or the bill
  // would read an hour later than the payment that cleared it.
  assert.match(items[1].body, /Meidcal FEE · 2024\/2025\. This one is settled\./)
  assert.equal(items[0].to, '/parent/invoices')
})

test('an unpaid bill is one event, and says it is outstanding', () => {
  const items = parentNotices([{ ...BILL, paystatus: 'Unpaid', payday: null }], [], NOW)
  assert.equal(items.length, 1)
  assert.match(items[0].body, /still outstanding/)
})

test('a paper still marked available after it shut is told as closed', () => {
  // The endpoint does not re-check its own clock; the register does.
  const [item] = parentNotices([], [HOUSEHOLD], NOW)
  assert.equal(item.title, "Simple additions closed without Diego's answers")
  assert.equal(item.kicker, 'Assessment')
  assert.equal(item.to, '/parent/tests')
  assert.equal(item.when, '28 Aug')
})

test('a paper the child sat says so, in the API’s own word', () => {
  const sat = { ...HOUSEHOLD, assignments: [{ ...PAPER, status: 'completed', assignment_id: 9 }] }
  const [item] = parentNotices([], [sat], NOW)
  assert.equal(item.title, 'Diego sat Simple additions')
})

test('an open paper names the child it is open for', () => {
  const open = {
    ...HOUSEHOLD,
    assignments: [
      { ...PAPER, opendate: '2026-09-01T09:00:00+01:00', closedate: '2026-09-30T10:00' },
    ],
  }
  const [item] = parentNotices([], [open], NOW)
  assert.equal(item.title, 'Simple additions is open for Diego')
  assert.equal(item.group, 'Today')
})

test('a paper that has not opened yet is not news', () => {
  const later = {
    ...HOUSEHOLD,
    assignments: [
      { ...PAPER, opendate: '2026-09-08T08:00:00+01:00', closedate: '2026-09-09T08:00' },
    ],
  }
  assert.deepEqual(parentNotices([], [later], NOW), [])
})

test('two children in one class are told apart on the same paper', () => {
  const sibling: ChildAssignment = {
    ...HOUSEHOLD,
    student: { ...HOUSEHOLD.student, id: 27, fname: 'Ada' },
  }
  assert.deepEqual(
    parentNotices([], [HOUSEHOLD, sibling], NOW).map((item) => item.id),
    ['paper-6-Diego', 'paper-6-Ada'],
  )
})

test('a record with no readable stamp has no place in a feed ordered by time', () => {
  assert.deepEqual(parentNotices([{ ...BILL, createdate: '', payday: null }], [], NOW), [])
})
