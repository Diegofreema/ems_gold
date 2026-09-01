import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Assignment } from '../../../../api/assignments/types.ts'
import type { Invoice } from '../../../../api/invoices/types.ts'
import type { MyPayment, MyResult } from '../../../../api/my-schooling/types.ts'
import { resultTerms, studentNotices } from './notices.ts'

/**
 * Pupil 4 (UDOYE OKIGBO, SSS I) on bronze, read 2026-09-01. The paper is the
 * only one set for their class; the bill and the payment are two of the three
 * on their ledger.
 */
const PAPER: Assignment = {
  id: 6,
  title: 'Simple additions',
  details: 'Please attempt all questions',
  test_type: 'cbt_test',
  status: 'active',
  subject_id: 2,
  subject: 'MATHEMATICS',
  department_id: 2,
  class: 'SSS I',
  opendate: '2026-08-27T10:03:00+01:00',
  closedate: '2026-08-28T10:08',
  time_limit: null,
  total_questions: 4,
  passing_score: 30,
  question_count: 1,
  my_status: 'submitted',
  submitted: true,
  window_problem: 'This test has closed.',
}

const BILL: Invoice = {
  id: 2453,
  fee_id: 6,
  student_id: 4,
  createdate: '2026-08-31T07:35:40+01:00',
  amount: '20000',
  paystatus: 'success',
  invoiceid: 'TSS6INV4',
  session_id: 8,
  payday: '2026-08-31 08:37:23',
  fee: { id: 6, name: 'Meidcal FEE', amount: 20000 },
}

const PAYMENT: MyPayment = {
  id: 19,
  invoice_id: 2453,
  fee_id: 6,
  session_id: 8,
  transdate: '2026-08-31T08:37:23+01:00',
  amount: '20000',
  discount: '0.00',
  paystatus: 'success',
  payref: 'MANUAL_CASH_20260831083723_1',
  pgateway: 'cash',
  notes: 'paid',
}

const NOW = new Date(2026, 8, 1, 14, 30)

const feed = (
  papers: Assignment[] = [],
  results: MyResult[] = [],
  invoices: Invoice[] = [],
  payments: MyPayment[] = [],
) => studentNotices(papers, results, invoices, payments, NOW)

test('a paper the pupil sat is dated by the last thing that happened to it', () => {
  const [item] = feed([PAPER])
  assert.equal(item.id, 'paper-6')
  assert.equal(item.kicker, 'Assessment')
  assert.equal(item.title, 'You sat Simple additions')
  // question_count, not total_questions: the teacher wrote one of the four.
  assert.match(item.body, /MATHEMATICS · 1 question\./)
  assert.equal(item.to, '/student/tests')
  // Closed on the 28th, which is later than the 27th it opened.
  assert.equal(item.when, '28 Aug')
})

test('a paper that has not opened yet is not news', () => {
  const later: Assignment = {
    ...PAPER,
    submitted: false,
    my_status: 'available',
    opendate: '2026-09-08T08:00:00+01:00',
    closedate: '2026-09-09T08:00',
    window_problem: 'This test has not opened.',
  }
  assert.deepEqual(feed([later]), [])
})

test('an open paper says to sit it, and is dated from when it opened', () => {
  const open: Assignment = {
    ...PAPER,
    submitted: false,
    my_status: 'available',
    opendate: '2026-09-01T09:00:00+01:00',
    closedate: '2026-09-30T10:00',
    window_problem: null,
  }
  const [item] = feed([open])
  assert.equal(item.title, 'Simple additions is open for you')
  assert.equal(item.when, '09:00')
  assert.equal(item.group, 'Today')
})

test('a paper that closed unsat says so rather than nothing', () => {
  const [item] = feed([{ ...PAPER, submitted: false, my_status: 'available' }])
  assert.equal(item.title, 'Simple additions closed without your answers')
})

test('a bill and the payment that settled it are two events, not one', () => {
  const items = feed([], [], [BILL], [PAYMENT])
  assert.deepEqual(
    items.map((item) => [item.id, item.title]),
    [
      ['payment-19', '₦20,000 was received'],
      ['bill-2453', '₦20,000 was billed to you'],
    ],
  )
  // The bursary's own note is the pupil's receipt; it stays word for word.
  assert.match(items[0].body, /MANUAL_CASH_20260831083723_1\. paid/)
  assert.match(items[1].body, /Meidcal FEE\. This one is settled/)
  assert.equal(items[0].kicker, 'Finance')
})

test('a bill still owing says so', () => {
  const [item] = feed([], [], [{ ...BILL, paystatus: 'Unpaid' }])
  assert.match(item.body, /still owing/)
})

test('a term of results is one item, dated by its newest mark', () => {
  const mark = (over: Partial<MyResult>): MyResult => ({
    id: 1,
    subject: { id: 2, name: 'MATHEMATICS' },
    semester: { id: 1, name: 'First Term' },
    session: { id: 8, name: '2024/2025' },
    uploaddate: '2026-08-20T09:00:00+01:00',
    ...over,
  })
  assert.deepEqual(
    resultTerms([
      mark({}),
      mark({ id: 2, uploaddate: '2026-08-22T09:00:00+01:00' }),
      mark({ id: 3, semester: { id: 2, name: 'Second Term' } }),
    ]).map((entry) => [entry.term, entry.count]),
    [
      ['First Term · 2024/2025', 2],
      ['Second Term · 2024/2025', 1],
    ],
  )

  const [item] = feed([], [mark({}), mark({ id: 2, uploaddate: '2026-08-22T09:00:00+01:00' })])
  assert.equal(item.title, 'First Term · 2024/2025 results are out')
  assert.match(item.body, /2 subjects/)
  assert.equal(item.when, '22 Aug')
  assert.equal(item.to, '/student/results')
})

test('a mark with no readable stamp has no place in a feed ordered by time', () => {
  assert.deepEqual(resultTerms([{ id: 1, uploaddate: null }]), [])
  assert.deepEqual(feed([], [], [{ ...BILL, createdate: '' }]), [])
  assert.deepEqual(feed([], [], [], [{ ...PAYMENT, transdate: null }]), [])
})

test('the whole feed is one order, newest first', () => {
  assert.deepEqual(
    feed([PAPER], [], [BILL], [PAYMENT]).map((item) => item.id),
    ['payment-19', 'bill-2453', 'paper-6'],
  )
})
