import assert from 'node:assert/strict'
import { test } from 'node:test'
import { IMPORT_COLUMNS, importOutcome } from './student-import.ts'

test('the template carries the school’s own headings, in its order and its capitals', () => {
  // Read off students_format.xlsx, row 1, A to J.
  assert.deepEqual(
    [...IMPORT_COLUMNS],
    ['Surname', 'First Name', 'Dob', 'Class', 'email', 'Address', 'phone', 'admission date', 'gender', 'Regno'],
  )
})

test('an answer with no count says the file was taken, and invents no figure', () => {
  assert.deepEqual(importOutcome(null), { message: 'The file was accepted.' })
  assert.deepEqual(importOutcome({ message: 'ok' }), { message: 'The file was accepted.' })
})

test('a count is read where the answer keeps one', () => {
  assert.equal(importOutcome({ imported: 12 }).message, '12 students imported.')
  assert.equal(importOutcome({ created: 1 }).message, '1 student imported.')
  assert.equal(importOutcome({ students: [{}, {}, {}] }).message, '3 students imported.')
  assert.equal(importOutcome({ result: { inserted: 4 } }).message, '4 students imported.')
})

test('refused rows are listed with their row and reason, and the page stays open for them', () => {
  const outcome = importOutcome({
    imported: 2,
    errors: [
      { row: 4, message: 'Class not found' },
      { line: '7', errors: ['Regno already used', 'Bad date'] },
      'Row 9 has no surname',
      { row: 11 },
      42,
    ],
  })
  assert.deepEqual(outcome.failures, [
    'Row 4: Class not found',
    'Row 7: Regno already used; Bad date',
    'Row 9 has no surname',
    'Row 11: not imported',
  ])
  assert.equal(outcome.failuresTitle, '4 rows were not imported')
  assert.match(outcome.message, /^2 students imported\. Some rows were not/)
})

test('refusals keyed by row are read too', () => {
  const outcome = importOutcome({ skipped: { 3: 'Duplicate', 5: { email: 'Invalid email' } } })
  assert.deepEqual(outcome.failures, ['Row 3: Duplicate', 'Row 5: Invalid email'])
  assert.equal(outcome.failuresTitle, '2 rows were not imported')
})

test('an empty list of refusals is no refusal at all', () => {
  assert.deepEqual(importOutcome({ imported: 5, errors: [] }), { message: '5 students imported.' })
})
