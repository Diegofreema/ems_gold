import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Loan } from '../../../api/library/types.ts'
import {
  loanBook,
  loanDeleteBody,
  loanFine,
  loanPaid,
  loanRow,
  loanStanding,
  loanStudent,
} from './loan-row.ts'

/**
 * The controller's live rows have not been read yet, so these fix the
 * contract's own names and the tolerated variants — the fixture is what the
 * document promises, not what bronze has been seen to send.
 */
const LOAN: Loan = {
  id: 7,
  student_id: 3,
  student_name: 'Diego Freeman',
  book_id: 14,
  book_title: 'Things Fall Apart',
  returned: 'No',
  paid: 'No',
  due_date: '2026-09-10',
  borrowed_on: '2026-08-27',
  fine: 0,
}

const TODAY = new Date('2026-09-03T09:00:00+01:00')

test('a loan reads by the names the contract flattens onto it', () => {
  const row = loanRow(LOAN, TODAY)
  assert.equal(row.id, '7')
  assert.equal(row.student, 'Diego Freeman')
  assert.equal(row.book, 'Things Fall Apart')
  assert.equal(row.due, '10 Sept 2026')
  assert.equal(row.standing, 'Out')
  assert.equal(row.fine, '—')
  assert.equal(row.paid, '—')
  assert.equal(row.due_raw, '2026-09-10')
})

test('names nested as records still read', () => {
  const nested: Loan = {
    id: 8,
    student: { fname: 'Ada', lname: 'Obi', regno: 'S-12' },
    book: { title: 'Arrow of God' },
  }
  assert.equal(loanStudent(nested), 'Ada Obi')
  assert.equal(loanBook(nested), 'Arrow of God')
})

test('a row carrying only ids still says which ids', () => {
  const bare: Loan = { id: 9, student_id: 5, book_id: 2 }
  assert.equal(loanStudent(bare), 'Student 5')
  assert.equal(loanBook(bare), 'Book 2')
})

test('past the due date and not back is overdue; the due day itself is not', () => {
  assert.equal(loanStanding({ ...LOAN, due_date: '2026-09-01' }, TODAY), 'Overdue')
  assert.equal(loanStanding({ ...LOAN, due_date: '2026-09-03' }, TODAY), 'Out')
  // Returned settles it whatever the date says.
  assert.equal(
    loanStanding({ ...LOAN, due_date: '2026-09-01', returned: 'Yes' }, TODAY),
    'Returned',
  )
})

test('the fine only shows once there is one, and owing follows it', () => {
  const fined: Loan = { ...LOAN, due_date: '2026-08-30', fine: 300 }
  const row = loanRow(fined, TODAY)
  assert.equal(row.standing, 'Overdue')
  assert.equal(row.fine, '₦300')
  assert.equal(row.paid, 'Owing')
  assert.equal(loanFine(fined), 300)
  // Paid is the API's word, not an inference from the figure.
  assert.equal(loanPaid({ ...fined, paid: 'Yes' }), 'Paid')
})

test('the delete confirm says the copy quietly goes back', () => {
  const body = loanDeleteBody(loanRow(LOAN, TODAY))
  assert.match(body, /Things Fall Apart against Diego Freeman/)
  assert.match(body, /goes back on the shelf/)
})
