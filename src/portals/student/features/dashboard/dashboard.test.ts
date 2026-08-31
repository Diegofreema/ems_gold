import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Invoice } from '../../../../api/invoices/types.ts'
import { paidTotal } from '../fees/fees.ts'
import {
  billEntries,
  feeBars,
  studentAction,
  type StudentStats,
  studentFigures,
  studentNote,
  unlistedNote,
} from './dashboard.ts'

/** `GET /students/me/dashboard` for pupil 4. */
const STATS: StudentStats = {
  invoices_total: 4,
  invoices_unpaid: 1,
  results_available: 0,
  materials_available: 0,
  fees_settled_this_session: 3,
}

/** Three of the four bills, which is all `/students/me/invoices` hands back. */
const INVOICES = [
  {
    id: 2453,
    amount: '20000',
    paystatus: 'success',
    invoiceid: 'TSS6INV4',
    createdate: '2026-08-31T07:35:40+01:00',
    payday: '2026-08-31 08:37:23',
    session: { id: 8, name: '2024/2025' },
    fee: { id: 6, name: 'Meidcal FEE' },
  },
  {
    id: 2440,
    amount: '30000',
    paystatus: 'success',
    invoiceid: 'TSS1/4',
    createdate: '2026-08-27T08:03:13+01:00',
    payday: '2026-08-27 09:23:47',
    session: { id: 8, name: '2024/2025' },
    fee: { id: 1, name: 'TUITION FEE' },
  },
  {
    id: 2441,
    amount: '30000',
    paystatus: 'success',
    invoiceid: 'TSS2/4',
    createdate: '2026-08-27T08:03:13+01:00',
    payday: '2026-08-31 08:37:55',
    session: { id: 8, name: '2024/2025' },
    fee: { id: 2, name: 'BUS FEE' },
  },
] as unknown as Invoice[]

test('the tiles count what the school says, and the money it took', () => {
  const [paid, unpaid, results, materials] = studentFigures(STATS, INVOICES)
  assert.deepEqual(paid, {
    label: 'Paid this session',
    amount: 80000,
    format: 'naira',
    delta: '3 invoices settled',
    hot: false,
  })
  assert.equal(unpaid?.amount, 1)
  assert.equal(unpaid?.delta, 'Of 4 invoices raised for you')
  assert.equal(unpaid?.hot, true)
  assert.equal(results?.delta, 'None approved yet')
  assert.equal(materials?.delta, 'Nothing shared yet')
})

test('only what a pupil can act on is flagged', () => {
  const cleared = studentFigures({ ...STATS, invoices_unpaid: 0 }, INVOICES)
  assert.equal(cleared[1]?.hot, false)
  assert.equal(cleared[1]?.delta, 'Nothing owing')
  assert.equal(cleared.filter((figure) => figure.hot).length, 0)
})

test('an unpaid bill is not counted as money taken', () => {
  const owing = [...INVOICES, { amount: '50000', paystatus: 'Unpaid' } as Invoice]
  assert.equal(paidTotal(owing), 80000)
})

test('the greeting says what is waiting, in the right number', () => {
  assert.equal(
    studentNote(STATS),
    '1 invoice of yours is still unpaid. No result has been published to you yet.',
  )
  assert.equal(
    studentNote({ ...STATS, invoices_unpaid: 2, results_available: 3 }),
    '2 invoices of yours are still unpaid. 3 results are ready to read.',
  )
  assert.match(studentNote({ ...STATS, invoices_unpaid: 0 }), /^Every invoice raised for you/)
  assert.match(
    studentNote({ ...STATS, results_available: 1 }),
    /1 result is ready to read\.$/,
  )
})

test('the button points at whatever needs the pupil', () => {
  assert.deepEqual(studentAction(STATS), { to: '/student/invoices', label: 'My invoices' })
  assert.deepEqual(studentAction({ ...STATS, invoices_unpaid: 0 }), {
    to: '/student/results',
    label: 'My results',
  })
})

test('the bills read newest first, each with what it was for', () => {
  const [newest] = billEntries(INVOICES)
  assert.equal(newest?.id, '2453')
  assert.equal(newest?.text, 'Meidcal FEE')
  assert.equal(newest?.who, '₦20,000 · TSS6INV4 · 2024/2025')
  assert.match(newest?.when ?? '', /^Paid 31 Aug 2026/)
  assert.equal(newest?.flagged, false)
})

test('a bill still owing is flagged and says so', () => {
  const [entry] = billEntries([
    { id: 9, amount: '50000', paystatus: 'Unpaid', invoiceid: null, createdate: null } as unknown as Invoice,
  ])
  assert.equal(entry?.text, 'Invoice 9')
  assert.equal(entry?.who, '₦50,000 · #9')
  assert.equal(entry?.when, 'Not paid')
  assert.equal(entry?.flagged, true)
})

test('the pupil is told what the list left out', () => {
  assert.equal(
    unlistedNote(STATS, 3),
    '1 invoice the school has raised for you is not listed here. Ask the bursary for it.',
  )
  assert.match(unlistedNote({ ...STATS, invoices_total: 6 }, 3) ?? '', /^3 invoices .* are not/)
  assert.equal(unlistedNote(STATS, 4), null)
})

test('each settled fee is a bar, named without the word "fee"', () => {
  const { bars, peak } = feeBars(INVOICES)
  assert.deepEqual(
    bars.map((bar) => bar.label),
    ['MEIDCAL', 'BUS', 'TUITION'],
  )
  assert.equal(bars[0]?.display, '₦20,000')
  assert.equal(peak, 30000)
})

test('nothing paid draws no bars, and never divides by zero', () => {
  const { bars, peak } = feeBars([])
  assert.deepEqual(bars, [])
  assert.equal(peak, 1)
})
