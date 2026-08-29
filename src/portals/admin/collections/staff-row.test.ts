import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Teacher } from '../../../api/teachers/types.ts'
import type { Admin } from '../../../api/users/types.ts'
import { adminRow, parseStaffKey, staffKey, staffTarget, teacherRow } from './staff-row.ts'

const teacher: Teacher = {
  id: 14, user_id: 90, firstname: 'Chukwuma', lastname: 'Nnaji', middlename: 'O',
  gender: 'Male', address: '2 Aba Road', country_id: null, state_id: null,
  phone: '08034412280', profile: null, cv: 'cv-14.pdf', qualification: 'B.Sc Mathematics',
  date_created: '2021-09-15T00:00:00Z', passport: null, department_id: 5,
  staffgrade_id: null, staffdepartment_id: null, isadviser: 'Yes',
}

const admin: Admin = {
  id: 3, user_id: 12, surname: 'Samuel', lastname: 'Idowu', status: 'Active',
  date_created: '2020-01-06T00:00:00Z', adminphoto: null, gender: 'Male',
  department_id: null, phone: '08065551234', address: null, dob: null, profile: null,
}

test('a teacher row names the two populations apart in its id', () => {
  assert.equal(teacherRow(teacher).id, 't-14')
  assert.equal(adminRow(admin).id, 'a-3')
})

test('a teacher row joins the three name parts in order', () => {
  assert.equal(teacherRow(teacher).name, 'Chukwuma O Nnaji')
})

test('the teaching record carries no status, so the cell stays blank', () => {
  assert.equal(teacherRow(teacher).status, '—')
  assert.equal(adminRow(admin).status, 'Active')
})

test('isadviser is read as what it means rather than Yes or No', () => {
  assert.equal(teacherRow(teacher).adviser, 'Takes an arm')
  assert.equal(teacherRow({ ...teacher, isadviser: 'No' }).adviser, 'No arm')
})

test('an office record without an expanded login is still an administrator', () => {
  assert.equal(adminRow(admin).role, 'Administrator')
  const withRole = { ...admin, user: { role: { id: 2, role_name: 'Bursary' } } } as Admin
  assert.equal(adminRow(withRole).role, 'Bursary')
})

test('the admin API calls the first half of the name surname', () => {
  const row = adminRow(admin)
  assert.equal(row.name, 'Samuel Idowu')
  assert.equal(row.surname, 'Samuel')
})

test('a key round-trips to the endpoint it came from', () => {
  assert.deepEqual(parseStaffKey(staffKey('admin', 3)), { kind: 'admin', id: '3' })
  assert.deepEqual(parseStaffKey(staffKey('teacher', 14)), { kind: 'teacher', id: '14' })
})

test('a bare id is read as a teacher rather than dropped', () => {
  assert.deepEqual(parseStaffKey('14'), { kind: 'teacher', id: '14' })
})

test('a missing qualification reads blank rather than empty', () => {
  assert.equal(teacherRow({ ...teacher, qualification: null }).qualification, '—')
})

test('a new record goes to the endpoint the form picked', () => {
  assert.equal(staffTarget(undefined, 'Administrators'), 'admin')
  assert.equal(staffTarget(undefined, 'Teacher'), 'teacher')
})

test('a pinned page overrides the form, which does not ask there', () => {
  assert.equal(staffTarget('admin', undefined), 'admin')
  assert.equal(staffTarget('teacher', 'Administrators'), 'teacher')
})

test('an edit follows the record, never the form or the page', () => {
  assert.equal(staffTarget(undefined, 'Administrators', 't-14'), 'teacher')
  assert.equal(staffTarget('teacher', 'Teacher', 'a-3'), 'admin')
})
