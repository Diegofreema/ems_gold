import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Loan } from '../../../api/library/types.ts'
import { myLoanRow } from './my-loan-row.ts'

/** As the contract promises `/loanedbooks/mine`; no live row read yet. */
const LOAN: Loan = {
  id: 4,
  book_title: 'Things Fall Apart',
  borrowed_on: '2026-08-20',
  due_date: '2026-08-30',
  returned: 'No',
  paid: 'No',
  fine: 250,
}

const TODAY = new Date('2026-09-03T09:00:00+01:00')

test('a pupil reads their loan without a student column', () => {
  const row = myLoanRow(LOAN, TODAY)
  assert.equal(row.book, 'Things Fall Apart')
  assert.equal(row.borrowed, '20 Aug 2026')
  assert.equal(row.due, '30 Aug 2026')
  assert.equal(row.standing, 'Overdue')
  assert.equal(row.fine, '₦250')
  assert.equal(row.paid, 'Owing')
  assert.equal('student' in row, false)
})

test('a returned loan reads settled', () => {
  const row = myLoanRow(
    { ...LOAN, returned: 'Yes', paid: 'Yes', returned_on: '2026-09-01', condition: 'Good' },
    TODAY,
  )
  assert.equal(row.standing, 'Returned')
  assert.equal(row.paid, 'Paid')
  assert.equal(row.returned_on, '01 Sept 2026')
  assert.equal(row.condition, 'Good')
})

test('a loan with no fine shows neither figure nor owing', () => {
  const row = myLoanRow({ ...LOAN, due_date: '2026-09-10', fine: 0 }, TODAY)
  assert.equal(row.standing, 'Out')
  assert.equal(row.fine, '—')
  assert.equal(row.paid, '—')
})
