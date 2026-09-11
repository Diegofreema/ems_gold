import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  classSubjectLines,
  directionTone,
  figure,
  gradeLines,
  moverLines,
  studentPointLines,
  riskLines,
  signed,
  subjectLines,
  termLines,
} from './performance.ts'

test('a term is read for whichever field names it', () => {
  for (const key of ['semester', 'term', 'label', 'name']) {
    const [only] = termLines([{ [key]: 'First Term', average: 62 }])
    assert.equal(only.name, 'First Term', key)
    assert.equal(only.average, 62, key)
  }
})

test('a row that names itself nothing is still numbered, never blank', () => {
  const [only] = termLines([{ average: 50 }])
  assert.equal(only.name, 'Term 1')
})

test('a subject with no figure comes back undefined, not zero', () => {
  const [only] = subjectLines([{ name: 'Maths' }], 55)
  assert.equal(only.average, undefined)
  assert.equal(only.gap, undefined)
})

test('the gap to the student’s own average is worked out where it is not sent', () => {
  const [only] = subjectLines([{ subject: 'Maths', average: 80 }], 55)
  assert.equal(only.gap, 25)
})

test('a gap the server did send is used as it stands', () => {
  const [only] = subjectLines([{ subject: 'Maths', average: 80, gap: -3 }], 55)
  assert.equal(only.gap, -3)
})

test('with no own average there is nothing to compare against', () => {
  const [only] = subjectLines([{ subject: 'Maths', average: 80 }], null)
  assert.equal(only.gap, undefined)
})

test('a class subject carries the spread, whatever the server calls it', () => {
  for (const key of ['spread', 'stdev', 'standard_deviation', 'range']) {
    const [only] = classSubjectLines([{ subject: 'Maths', [key]: 12.5 }])
    assert.equal(only.spread, 12.5, key)
  }
})

test('highest and lowest are read under their common spellings', () => {
  const [only] = classSubjectLines([{ subject: 'Maths', max: 91, min: 12 }])
  assert.equal(only.highest, 91)
  assert.equal(only.lowest, 12)
})

test('a grade bucket with no count reads as none, not as missing', () => {
  const [only] = gradeLines([{ grade: 'A' }])
  assert.deepEqual([only.name, only.count], ['A', 0])
})

test('a mover’s change is worked out from the two ends where it is not sent', () => {
  const [only] = moverLines([{ name: 'Ada Obi', from: 48, to: 61 }])
  assert.equal(only.change, 13)
})

test('a fall is negative, and a change the server sent wins', () => {
  const [fell] = moverLines([{ name: 'Ada', before: 70, after: 55 }])
  assert.equal(fell.change, -15)
  const [sent] = moverLines([{ name: 'Ada', from: 70, to: 55, delta: -14 }])
  assert.equal(sent.change, -14)
})

test('a mover with only one end has no change to report', () => {
  const [only] = moverLines([{ name: 'Ada', to: 61 }])
  assert.equal(only.change, undefined)
})

test('an attendance-vs-marks row carries both axes', () => {
  const [only] = studentPointLines([
    { student_name: 'Ada Obi', attendance_rate: 92, average: 64 },
  ])
  assert.deepEqual([only.name, only.attendance, only.average], ['Ada Obi', 92, 64])
})

test('a flagged student keeps every reason the school gave', () => {
  const [only] = riskLines([
    { name: 'Ada Obi', reasons: ['Below the pass mark', 'Attendance under 75%'] },
  ])
  assert.deepEqual(only.reasons, ['Below the pass mark', 'Attendance under 75%'])
})

test('a single reason sent as a string is still a reason', () => {
  const [only] = riskLines([{ name: 'Ada', why: 'Below the pass mark' }])
  assert.deepEqual(only.reasons, ['Below the pass mark'])
})

test('a flagged student with no reasons has none — the screen must not invent one', () => {
  const [only] = riskLines([{ name: 'Ada' }])
  assert.deepEqual(only.reasons, [])
})

test('an expanded name is read for its name', () => {
  const [only] = riskLines([{ student: { id: 3, name: 'Ada Obi' } }])
  assert.equal(only.name, 'Ada Obi')
})

test('the direction is read as a tone, and anything unrecognised is neutral', () => {
  assert.equal(directionTone('rising'), 'up')
  assert.equal(directionTone('Improving'), 'up')
  assert.equal(directionTone('falling'), 'down')
  assert.equal(directionTone('steady'), 'muted')
  assert.equal(directionTone(null), 'muted')
})

test('a figure shows a dash for nothing, never a zero', () => {
  assert.equal(figure(undefined), '—')
  assert.equal(figure(null), '—')
  assert.equal(figure(0), '0')
  assert.equal(figure(64.25, '%'), '64.3%')
  assert.equal(figure(64), '64')
})

test('a change is always signed', () => {
  assert.equal(signed(4), '+4')
  assert.equal(signed(-4.26), '-4.3')
  assert.equal(signed(0), '0')
  assert.equal(signed(undefined), '—')
})
