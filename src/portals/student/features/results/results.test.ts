import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { MyResult } from '../../../../api/my-schooling/types.ts'
import { resultRows, termOf } from './results.ts'

/**
 * One approved mark. No pupil on this school has one, so this is the shape
 * `/teachers/me/results` sends off the same table — see `MyResult`.
 */
const RESULT = {
  id: 41,
  subject_id: 3,
  ca: '26.00',
  score: '52.00',
  total: '78.00',
  grade: 'A',
  remark: 'Excellent',
  approval_status: 'approved',
  uploaddate: '2026-08-27T09:23:47+01:00',
  session: { id: 8, name: '2024/2025' },
  semester: { id: 1, name: 'First Term' },
  subject: { id: 3, name: 'Mathematics' },
  department: { id: 2, name: 'SSS I' },
} as MyResult

test('a mark reads as the sheet has it', () => {
  const [row] = resultRows([RESULT])
  assert.equal(row?.subject, 'Mathematics')
  assert.equal(row?.term, 'First Term · 2024/2025')
  assert.equal(row?.session, '2024/2025')
  assert.equal(row?.semester, 'First Term')
  assert.equal(row?.ca, '26')
  assert.equal(row?.exam, '52')
  assert.equal(row?.total, '78')
  assert.equal(row?.grade, 'A')
  assert.equal(row?.remark, 'Excellent')
})

test('the quoted decimals the API sends are read as numbers', () => {
  const [row] = resultRows([{ ...RESULT, ca: 26.5, score: '52.25', total: null }])
  assert.equal(row?.ca, '26.5')
  assert.equal(row?.exam, '52.25')
  assert.equal(row?.total, '—')
})

test('a mark whose subject was not expanded is still nameable', () => {
  const [row] = resultRows([{ ...RESULT, subject: null }])
  assert.equal(row?.subject, 'Subject 3')
  const [bare] = resultRows([{ ...RESULT, subject: null, subject_id: null }])
  assert.equal(bare?.subject, 'Subject 41')
})

test('a mark with no term on it says so rather than reading as one', () => {
  assert.equal(termOf({ ...RESULT, session: null, semester: null }), '—')
  assert.equal(termOf({ ...RESULT, semester: null }), '2024/2025')
})

test('the newest mark is the one at the top', () => {
  const rows = resultRows([
    { ...RESULT, id: 12 },
    { ...RESULT, id: 41 },
    { ...RESULT, id: 30 },
  ])
  assert.deepEqual(rows.map((row) => row.id), ['41', '30', '12'])
})

test('no marks is no rows', () => {
  assert.deepEqual(resultRows([]), [])
})
