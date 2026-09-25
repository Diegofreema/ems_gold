import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  applicationBody,
  applicationReference,
  checkStep,
  draftOf,
  EMPTY_APPLICATION,
  firstFailingStep,
  namedRows,
  restoreDraft,
  schoolFieldErrors,
  stepOf,
  type ApplicationValues,
} from './application.ts'

const TODAY = '2026-09-25'

/** The school's own example request, as the form would hold it. */
const filled: ApplicationValues = {
  fname: 'Chidi okon',
  lname: 'Okafor oko',
  mname: 'Ebuka',
  dob: '2011-03-12',
  gender: 'Male',
  religion: 'Christianity',
  department_id: '1',
  phone: '08031234567',
  email: '',
  address: '14 Douglas Road, Owerri',
  state_id: '2648',
  lga_id: '',
  pschools: 'Sunrise Primary School',
  fathersname: 'Emeka Okafor',
  fatherphone: '08031111111',
  fathersjob: 'Trader',
  mothersname: 'Ngozi Okafor',
  motherphone: '08032222222',
  mothersjob: 'Teacher',
  pemailaddress: 'okafo.family@example.com',
}

test('the body is the school’s own example request, key for key', () => {
  assert.deepEqual(applicationBody(filled), {
    fname: 'Chidi okon',
    lname: 'Okafor oko',
    mname: 'Ebuka',
    dob: '2011-03-12',
    gender: 'Male',
    address: '14 Douglas Road, Owerri',
    phone: '08031234567',
    department_id: 1,
    state_id: 2648,
    country_id: 160,
    pschools: 'Sunrise Primary School',
    religion: 'Christianity',
    email: '',
    fathersname: 'Emeka Okafor',
    mothersname: 'Ngozi Okafor',
    fatherphone: '08031111111',
    motherphone: '08032222222',
    fathersjob: 'Trader',
    mothersjob: 'Teacher',
    pemailaddress: 'okafo.family@example.com',
  })
})

test('an LGA goes out only where one was picked, and documents only where attached', () => {
  const passport = new File(['x'], 'chidi.jpg', { type: 'image/jpeg' })
  const body = applicationBody({ ...filled, lga_id: '901', passport })
  assert.equal(body.lga_id, 901)
  assert.equal(body.passport, passport)
  assert.equal('birth_certificate' in body, false)
  assert.equal('lga_id' in applicationBody(filled), false)
})

test('a filled form passes every step', () => {
  for (let step = 0; step < 5; step++) assert.deepEqual(checkStep(step, filled, TODAY), {})
  assert.equal(firstFailingStep(filled, TODAY), undefined)
})

test('the first step asks for the class, since the school refuses an application without one', () => {
  const errors = checkStep(0, { ...filled, department_id: '' }, TODAY)
  assert.deepEqual(Object.keys(errors), ['department_id'])
})

test('a date of birth cannot be in the future', () => {
  assert.match(checkStep(0, { ...filled, dob: '2027-01-01' }, TODAY).dob ?? '', /future/)
  assert.deepEqual(checkStep(0, { ...filled, dob: TODAY }, TODAY), {})
})

test('the state is required and the LGA is not', () => {
  const errors = checkStep(1, { ...filled, state_id: '', lga_id: '' }, TODAY)
  assert.deepEqual(Object.keys(errors), ['state_id'])
})

test('one parent is enough, but somebody and some number are needed', () => {
  const onlyMother = {
    ...filled,
    fathersname: '',
    fatherphone: '',
    fathersjob: '',
  }
  assert.deepEqual(checkStep(2, onlyMother, TODAY), {})

  const nobody = { ...onlyMother, mothersname: '', motherphone: '' }
  const errors = checkStep(2, nobody, TODAY)
  assert.ok(errors.fathersname)
  assert.ok(errors.fatherphone)
})

test('the parents’ rules are reported beside a bad address, not after it', () => {
  const errors = checkStep(2, { ...filled, fathersname: '', mothersname: '', pemailaddress: 'nope' }, TODAY)
  assert.ok(errors.fathersname)
  assert.ok(errors.pemailaddress)
})

test('the household address is required and must be an address', () => {
  assert.equal(checkStep(2, { ...filled, pemailaddress: '' }, TODAY).pemailaddress, 'Required')
  assert.ok(checkStep(2, { ...filled, pemailaddress: 'okafor' }, TODAY).pemailaddress)
})

test('a document over 1 MB is refused in its own size', () => {
  const big = new File([new Uint8Array(1024 * 1024 + 1)], 'scan.pdf', { type: 'application/pdf' })
  const exact = new File([new Uint8Array(1024 * 1024)], 'scan.pdf', { type: 'application/pdf' })
  assert.match(checkStep(3, { birth_certificate: big }, TODAY).birth_certificate ?? '', /1 MB/)
  assert.deepEqual(checkStep(3, { birth_certificate: exact }, TODAY), {})
})

test('a send with a gap goes back to the first step holding it', () => {
  assert.equal(firstFailingStep({ ...filled, address: '' }, TODAY), 1)
  assert.equal(firstFailingStep({ ...filled, fname: '', pemailaddress: '' }, TODAY), 0)
})

test('the reference is read where student answers keep it, and not invented', () => {
  assert.equal(applicationReference({ student: { application_no: 'APP/2026/0042' } }), 'APP/2026/0042')
  assert.equal(applicationReference({ application_no: 'APP/2026/7' }), 'APP/2026/7')
  assert.equal(applicationReference({ applicant: { regno: '2026/0001' } }), '2026/0001')
  assert.equal(applicationReference({ student: { application_no: '' } }), undefined)
  assert.equal(applicationReference(null), undefined)
})

test('a lookup is read under its own name, or as a bare list, and junk rows are dropped', () => {
  assert.deepEqual(namedRows({ departments: [{ id: 1, name: 'JSS I' }, { id: 2, name: 'JSS II' }] }, 'departments'), [
    { id: 1, name: 'JSS I' },
    { id: 2, name: 'JSS II' },
  ])
  assert.deepEqual(namedRows([{ id: '2648', name: ' Adamawa ' }, { id: 0, name: 'x' }, { id: 3 }], 'states'), [
    { id: 2648, name: 'Adamawa' },
  ])
  assert.deepEqual(namedRows({ something: [] }, 'lgas'), [])
})

test('a draft keeps the typing and never the files', () => {
  const passport = new File(['x'], 'chidi.jpg')
  const draft = draftOf({ ...filled, passport })
  assert.equal('passport' in draft, false)
  assert.deepEqual(restoreDraft(JSON.stringify(draft)), { ...EMPTY_APPLICATION, ...draftOf(filled) })
})

test('a broken or foreign draft opens an empty form', () => {
  assert.deepEqual(restoreDraft('{not json'), EMPTY_APPLICATION)
  assert.deepEqual(restoreDraft(null), EMPTY_APPLICATION)
  assert.deepEqual(restoreDraft(JSON.stringify({ fname: 7, admin: 'yes' })), EMPTY_APPLICATION)
})

test('the school’s refusals land under the boxes it names', () => {
  assert.deepEqual(
    schoolFieldErrors({
      department_id: { _required: 'Choose a class' },
      country_id: { existsIn: 'Unknown country' },
      secret: { x: 'Not a box here' },
    }),
    { department_id: 'Choose a class', state_id: 'Unknown country' },
  )
  assert.deepEqual(schoolFieldErrors(undefined), {})
})

test('a box is found on its own step', () => {
  assert.equal(stepOf('department_id'), 0)
  assert.equal(stepOf('lga_id'), 1)
  assert.equal(stepOf('pemailaddress'), 2)
  assert.equal(stepOf('passport'), 3)
})
