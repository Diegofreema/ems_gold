import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Student } from '../../../../api/my-schooling/types.ts'
import { recordRows } from './record.ts'

/** `GET /students/me` for pupil 4, as the API sends it. */
const STUDENT = {
  fname: 'UDOYE',
  lname: 'OKIGBO',
  mname: 'OZOMGBO',
  dob: '02/08/2026',
  gender: 'Male',
  email: '',
  phone: '09000000000',
  address: 'OWERRRI',
  regno: 'CUN/2026/4',
  application_no: 'CUN/APP20264',
  joindate: '2026-08-26T12:08:43+01:00',
  community: 'OWERRI',
  previousschool: '',
  fathersname: '',
  mothersname: '',
  fatherphone: '',
  motherphone: '',
  status: 'Admitted',
  religion: 'X',
  sparent_id: 1,
  class_arm: { id: 4, arm_name: 'JSS 2 A' },
  department: { id: 2, name: 'SSS I' },
  level: { id: 1, name: '100 Level' },
  lga: { id: 13, name: 'Ukwa East' },
  state: { id: 2647, name: 'Abia' },
  country: { id: 160, name: 'Nigeria' },
  user: { id: 483, username: 'UDOYE2608264308', userstatus: 'Enabled' },
} as unknown as Student

const valueOf = (rows: ReturnType<typeof recordRows>, id: string) =>
  rows.find((row) => row.id === id)?.value

test('the record reads back what the school holds', () => {
  const rows = recordRows(STUDENT)
  assert.equal(valueOf(rows, 'name'), 'UDOYE OZOMGBO OKIGBO')
  assert.equal(valueOf(rows, 'adm'), 'CUN/2026/4')
  assert.equal(valueOf(rows, 'class'), 'JSS 2 A')
  assert.equal(valueOf(rows, 'lga'), 'Ukwa East')
  assert.equal(valueOf(rows, 'country'), 'Nigeria')
  assert.equal(valueOf(rows, 'joined'), '26 Aug 2026')
})

test('a birthday is left in the order the API wrote it', () => {
  assert.equal(valueOf(recordRows(STUDENT), 'dob'), '02/08/2026')
})

test('a field the office left blank is listed as blank, not dropped', () => {
  const rows = recordRows(STUDENT)
  assert.equal(valueOf(rows, 'father'), '—')
  assert.equal(valueOf(rows, 'motherphone'), '—')
  assert.equal(valueOf(rows, 'email'), '—')
  assert.equal(valueOf(rows, 'school'), '—')
})

test('every row says who can change it, and only two are the pupil’s', () => {
  const rows = recordRows(STUDENT)
  assert.equal(rows.every((row) => Boolean(row.who)), true)
  const mine = rows.filter((row) => row.who.startsWith('Yours')).map((row) => row.id)
  assert.deepEqual(mine, ['phone', 'address'])
})

test('the linked parent account is told apart from none', () => {
  assert.equal(valueOf(recordRows(STUDENT), 'guardian'), 'Linked to your record')
  assert.equal(
    valueOf(recordRows({ ...STUDENT, sparent_id: null }), 'guardian'),
    'None linked',
  )
})

test('no record answers with no rows rather than a page of dashes', () => {
  assert.deepEqual(recordRows(), [])
})
