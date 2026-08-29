import assert from 'node:assert/strict'
import { test } from 'node:test'
import { adminBody, adminUpdate, teacherBody, teacherUpdate } from './staff-body.ts'

const values = {
  username: 'cnnaji',
  firstname: 'Chukwuma',
  lastname: 'Nnaji',
  middlename: '  ',
  gender: 'Male',
  phone: '08034412280',
  address: '',
  department_id: '5',
  qualification: 'B.Sc Mathematics',
}

test('empty fields are dropped rather than sent blank', () => {
  const body = teacherBody(values)
  assert.equal('middlename' in body && body.middlename, undefined)
  assert.equal(body.address, undefined)
  assert.equal(body.phone, '08034412280')
})

test('a select holding an id sends it as a number', () => {
  assert.equal(teacherBody(values).department_id, 5)
  assert.equal(teacherBody({ ...values, department_id: '' }).department_id, undefined)
  assert.equal(teacherBody({ ...values, department_id: '0' }).department_id, undefined)
})

test('the admin endpoint takes the first name under surname', () => {
  const body = adminBody(values)
  assert.equal(body.surname, 'Chukwuma')
  assert.equal(body.lastname, 'Nnaji')
})

test('an edit never sends the username, which would rename a sign-in', () => {
  assert.equal('username' in teacherUpdate(values), false)
  assert.equal('username' in adminUpdate(values), false)
  assert.equal(teacherBody(values).username, 'cnnaji')
})

test('qualification is a teaching field and does not reach the office record', () => {
  assert.equal(teacherBody(values).qualification, 'B.Sc Mathematics')
  assert.equal('qualification' in adminBody(values), false)
})
