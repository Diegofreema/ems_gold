import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { AttendanceRecord } from '../../api/attendance/types.ts'
import type {
  Child as EnrolledChild,
  FamilyInvoice,
} from '../../api/parents/types.ts'
import type { CollectInvoice } from '../../api/collect-fees/types.ts'
import {
  asFamilyInvoice,
  childFull,
  childName,
  familyChild,
  familyOwing,
  invoiceRow,
  schoolTime,
  weeksPresent,
} from './family.ts'

/** Verbatim from GET /sparents/1/children. */
const ENROLLED: EnrolledChild = {
  id: 4,
  regno: 'CUN/2026/4',
  fname: 'UDOYE',
  lname: 'OKIGBO',
  mname: 'OZOMGBO',
  gender: 'Male',
  studentstatus: null,
  department_id: 2,
  department: 'SSS I',
  class_arm: 'JSS 2 A',
} as EnrolledChild

/** Verbatim from GET /sparents/my-invoices — amounts are strings here. */
function billed(over: Partial<FamilyInvoice>): FamilyInvoice {
  return {
    id: 2441,
    student_id: 4,
    student: 'UDOYE OKIGBO',
    fee: 'BUS FEE',
    session: '2024/2025',
    amount: '30000',
    paystatus: 'Unpaid',
    payday: null,
    createdate: '2026-08-27T08:03:13+00:00',
    ...over,
  }
}

function mark(over: Partial<AttendanceRecord>): AttendanceRecord {
  return {
    id: 7,
    attendance_date: '2026-08-27',
    status: 'present',
    notes: '',
    student: { id: 4, regno: null, name: 'UDOYE OKIGBO', department: null, class_arm: null },
    ...over,
  }
}

/** A Sunday, which belongs to the week that began on the 24th. */
const TODAY = new Date(2026, 7, 30)

test('a pupil is named as the school entered them, in the order it writes them', () => {
  assert.equal(childFull(ENROLLED), 'UDOYE OZOMGBO OKIGBO')
  assert.equal(childName(ENROLLED), 'UDOYE')
})

test('a pupil with no name on record is still nameable', () => {
  const nameless = { ...ENROLLED, fname: '', mname: null, lname: '' } as EnrolledChild
  assert.equal(childFull(nameless), 'Pupil 4')
  assert.equal(childName(nameless), 'Pupil 4')
})

test('an invoice is paid in full or not at all, so amount splits in two', () => {
  const owing = invoiceRow(billed({}))
  assert.equal(owing.paid, '₦0')
  assert.equal(owing.balance, '₦30,000')
  assert.equal(owing.state, 'Owing')

  const settled = invoiceRow(
    billed({ paystatus: 'success', payday: '2026-08-27 09:23:47' }),
  )
  assert.equal(settled.paid, '₦30,000')
  assert.equal(settled.balance, '₦0')
  assert.equal(settled.state, 'Paid')
  assert.match(settled.settledOn, /27 Aug 2026/)
})

test('the wall clock is the school\u2019s, whatever offset this endpoint stamps on it', () => {
  // The counter's ledger sends the same invoice as `11:34:46+01:00`; this list
  // sends `+00:00`. Believed, it would move a bill raised at 23:30 to the next
  // day.
  assert.equal(schoolTime('2026-08-27T23:34:46+00:00'), '2026-08-27T23:34:46')
  assert.equal(schoolTime('2026-08-27T23:34:46+01:00'), '2026-08-27T23:34:46')
  assert.equal(schoolTime('2026-08-27T23:34:46Z'), '2026-08-27T23:34:46')
  assert.equal(invoiceRow(billed({ createdate: '2026-08-27T23:34:46+00:00' })).raised,
    '27 Aug 2026')
  assert.equal(schoolTime(null), null)
})

test('every week in the window is drawn, including the ones nobody marked', () => {
  const weeks = weeksPresent([mark({}), mark({ id: 8, status: 'absent' })], TODAY)
  assert.equal(weeks.length, 6)
  // Sunday the 30th belongs to the week that began Monday the 24th.
  assert.equal(weeks.at(-1)?.label, '24 Aug')
  assert.deepEqual(weeks.at(-1), { label: '24 Aug', present: 1, marked: 2 })
  assert.deepEqual(
    weeks.slice(0, 5).map((week) => week.marked),
    [0, 0, 0, 0, 0],
  )
})

test('a late mark counts as having been in school, as the API counts it', () => {
  const weeks = weeksPresent([mark({ status: 'late' })], TODAY)
  assert.deepEqual(weeks.at(-1), { label: '24 Aug', present: 1, marked: 1 })
})

test('a child is what the three endpoints say between them', () => {
  const child = familyChild(
    ENROLLED,
    [
      billed({ id: 2440, amount: '30000', paystatus: 'success' }),
      billed({ id: 2441, amount: '30000' }),
      billed({ id: 36, amount: '5500', session: null }),
    ],
    [mark({}), mark({ id: 8, status: 'absent' })],
    TODAY,
  )

  assert.equal(child.id, 4)
  assert.equal(child.arm, 'JSS 2 A')
  assert.equal(child.adm, 'CUN/2026/4')
  assert.equal(child.owing, 35_500)
  assert.equal(child.paid, 30_000)
  assert.equal(child.present, 1)
  assert.equal(child.marked, 2)
  assert.equal(child.invoices.length, 3)
})

test('a pupil the school has issued no number to is still identified', () => {
  const child = familyChild({ ...ENROLLED, regno: null } as EnrolledChild, [], [], TODAY)
  assert.equal(child.adm, 'Pupil 4')
  // No arm on record falls back to the class, which is what the switcher shows.
  const classOnly = { ...ENROLLED, class_arm: null } as EnrolledChild
  assert.equal(familyChild(classOnly, [], [], TODAY).arm, 'SSS I')
})

test('the household owes what its children owe between them', () => {
  const one = familyChild(ENROLLED, [billed({ amount: '30000' })], [], TODAY)
  const two = familyChild(ENROLLED, [billed({ amount: '5500' })], [], TODAY)
  assert.equal(familyOwing([one, two]), 35_500)
  assert.equal(familyOwing([]), 0)
})

/** Verbatim from GET /collect-fees/students/16/invoices — the discounted one. */
const COUNTER: CollectInvoice = {
  id: 2450,
  student_id: 16,
  student: { id: 16, regno: 'NETPRO/2026/16', name: 'OKONKWO ARINZE', department: 'JSS 1' },
  fee: 'TUITION FEE',
  session: '2024/2025',
  amount: 30000,
  // The invoices table still reads Unpaid; the counter has it settled.
  paystatus: 'Unpaid',
  is_settled: true,
  payday: '2026-08-27 12:56:13',
  createdate: '2026-08-27T11:34:46+01:00',
  transactions: [],
}

test('a counter ledger reads as the household list would have sent it', () => {
  assert.deepEqual(asFamilyInvoice(COUNTER, 16), {
    id: 2450,
    student_id: 16,
    student: 'OKONKWO ARINZE',
    fee: 'TUITION FEE',
    session: '2024/2025',
    amount: '30000',
    paystatus: 'success',
    payday: '2026-08-27 12:56:13',
    createdate: '2026-08-27T11:34:46+01:00',
  })
})

test('the counter decides whether a bill is settled, not the invoices table', () => {
  // A bill closed by a discounted payment reads Unpaid on the table it lives
  // in; showing it as owing would bill a family twice for the same term.
  assert.equal(invoiceRow(asFamilyInvoice(COUNTER, 16)).state, 'Paid')
  assert.equal(
    invoiceRow(asFamilyInvoice({ ...COUNTER, is_settled: false }, 16)).state,
    'Owing',
  )
})

test('a ledger whose pupil the API left off is still filed under the right child', () => {
  const orphan = { ...COUNTER, student_id: 0, student: null } as CollectInvoice
  const mapped = asFamilyInvoice(orphan, 16)
  assert.equal(mapped.student_id, 16)
  assert.equal(mapped.student, null)
})
