import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { MyCourse } from '../../../../api/my-schooling/types.ts'
import { courseRows, teachersOf } from './courses.ts'

/*
 * No pupil in the school is registered for anything, so no live course row
 * exists to copy. These are the subject rows `/teachers/me/subjects` and
 * `/subjects/{id}` do send, which is the shape `MyCourse` documents.
 */
const MATHS: MyCourse = {
  id: 2,
  name: 'MATHEMATICS',
  subjectcode: 'MATH',
  department_id: 2,
  department: { id: 2, name: 'SSS I' },
  teachers: [{ id: 2, name: 'Teacher u 1 New Teacher' }],
}

test('a course reads as its code, its subject, its class and who teaches it', () => {
  const [row] = courseRows([MATHS])
  assert.equal(row.code, 'MATH')
  assert.equal(row.name, 'MATHEMATICS')
  assert.equal(row.klass, 'SSS I')
  assert.equal(row.teacher, 'Teacher u 1 New Teacher')
})

test('alphabetical, because a pupil scans the list for one subject', () => {
  const rows = courseRows([
    { ...MATHS, id: 2, name: 'MATHEMATICS' },
    { ...MATHS, id: 1, name: 'ENGLISH LANGUAGE' },
    { ...MATHS, id: 11, name: 'Social Studies' },
  ])
  assert.deepEqual(rows.map((row) => row.name), [
    'ENGLISH LANGUAGE',
    'MATHEMATICS',
    'Social Studies',
  ])
})

test('two teachers are both named, and none reads as blank', () => {
  assert.equal(
    teachersOf({ ...MATHS, teachers: [{ id: 2, name: 'C. Nnaji' }, { id: 15, name: 'D. Freeman' }] }),
    'C. Nnaji, D. Freeman',
  )
  assert.equal(teachersOf({ ...MATHS, teachers: [] }), '—')
  assert.equal(teachersOf({ id: 2 }), '—')
})

test('a course sent without its name is still nameable by its id', () => {
  const [row] = courseRows([{ id: 7 }])
  assert.equal(row.name, 'Subject 7')
  assert.equal(row.code, '—')
  assert.equal(row.klass, '—')
})

test('no registration is no rows, not a row of dashes', () => {
  assert.deepEqual(courseRows([]), [])
})
