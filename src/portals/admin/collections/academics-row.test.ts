import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { ClassArm } from '../../../api/class-arms/types.ts'
import type { Subject } from '../../../api/subjects/types.ts'
import {
  armPupilRow,
  armRow,
  subjectRow,
  subjectStatus,
  titleCase,
} from './academics-row.ts'

const arm: ClassArm = {
  id: 4, department_id: 5, arm_name: 'JSS1 A',
  arm_description: 'Morning stream', class_teacher_id: 14, status: 'active',
}

const subject: Subject = {
  id: 9, name: 'Mathematics', subjectcode: 'MTH', department_id: 5,
  creditload: 3, semester_id: null, level_id: null, status: 1, user_id: 1,
  teachers: [
    { id: 14, firstname: 'Chukwuma', lastname: 'Nnaji' },
    { id: 21, firstname: 'Aisha', lastname: 'Mohammed' },
  ],
}

const CLASSES = new Map([['5', 'JSS 1']])
const TEACHERS = new Map([['14', 'Chukwuma Nnaji']])

test('an arm names its class and form teacher from the feeds', () => {
  const row = armRow(arm, CLASSES, TEACHERS)
  assert.equal(row.arm, 'JSS1 A')
  assert.equal(row.klass, 'JSS 1')
  assert.equal(row.teacher, 'Chukwuma Nnaji')
})

test('an arm with no feed to read from reads blank, not undefined', () => {
  const row = armRow(arm)
  assert.equal(row.klass, '—')
  assert.equal(row.teacher, '—')
})

test('an arm with no form teacher does not go looking for one', () => {
  assert.equal(armRow({ ...arm, class_teacher_id: null }, CLASSES, TEACHERS).teacher, '—')
})

test('statuses are shown as words, not as the API spells them', () => {
  assert.equal(titleCase('active'), 'Active')
  assert.equal(armRow({ ...arm, status: 'archived' }).status, 'Archived')
})

test('the roll comes from the dependency counts the detail endpoint sends', () => {
  assert.equal(armRow(arm).roll, '—')
  assert.equal(armRow({ ...arm, dependencies: { students: 38 } }).roll, '38')
  assert.equal(armRow({ ...arm, dependencies: { students: 0 } }).roll, '0')
})

test('the status prefills as the form spells it, not as the API does', () => {
  // A value matching none of the options would open the select on nothing.
  assert.equal(armRow(arm).armstatus, 'Active')
  assert.equal(armRow({ ...arm, status: 'archived' }).armstatus, 'Archived')
})

test('the edit form prefills with ids, and blank where there is no choice', () => {
  const row = armRow(arm)
  assert.equal(row.department_id, '5')
  assert.equal(row.class_teacher_id, '14')
  assert.equal(armRow({ ...arm, class_teacher_id: null }).class_teacher_id, '')
})

test('a subject counts the teachers its record expands', () => {
  const row = subjectRow(subject, CLASSES)
  assert.equal(row.teachers, '2')
  assert.equal(row.staff, 'Chukwuma Nnaji, Aisha Mohammed')
  assert.equal(row.klass, 'JSS 1')
})

test('a subject nobody teaches counts zero rather than reading blank', () => {
  assert.equal(subjectRow({ ...subject, teachers: [] }).teachers, '0')
  assert.equal(subjectRow({ ...subject, teachers: undefined }).teachers, '0')
})

test('the API spells a subject status as a number', () => {
  assert.equal(subjectStatus(1), 'Active')
  assert.equal(subjectStatus(0), 'Inactive')
  assert.equal(subjectRow({ ...subject, status: 0 }).status, 'Inactive')
})

test('a credit load of null is blank, and zero is not mistaken for it', () => {
  assert.equal(subjectRow({ ...subject, creditload: null }).credit, '—')
  assert.equal(subjectRow(subject).credit, '3')
})

test('a pupil on the arm tab reads their number and status', () => {
  const pupil = {
    id: 10, fname: 'Chinedu', lname: 'Udo', mname: null,
    regno: 'NEB/2021/0412', application_no: null,
    studentstatus: 'Active', status: 'Admitted',
  } as never
  const row = armPupilRow(pupil, true)
  assert.equal(row.name, 'Chinedu Udo')
  assert.equal(row.adm, 'NEB/2021/0412')
  assert.equal(row.status, 'Active')
  assert.equal(row.placed, 'In this arm')
})

test('a pupil the arm could still take is not counted as being in it', () => {
  const waiting = {
    id: 11, fname: 'Tolu', lname: 'Ayo', mname: null,
    regno: null, application_no: 'APP/0091',
    studentstatus: null, status: 'Admitted',
  } as never
  const row = armPupilRow(waiting, false)
  assert.equal(row.placed, 'Not placed')
  // No reg number yet, so the application number stands in for one.
  assert.equal(row.adm, 'APP/0091')
})
