import assert from 'node:assert/strict'
import { test } from 'node:test'
import { invoiceRow, resultRow, studentRow, suspendAction } from './student-row.ts'

/** Straight from GET /students/{id}, trimmed to what the page reads. */
const student = {
  id: 10,
  fname: 'Aniegbokas',
  lname: 'Chukwudi',
  mname: null,
  dob: '10/11/1986',
  joindate: '2026-08-27T08:15:52+01:00',
  email: 'chukd5@outlook.com',
  phone: '90889988765',
  address: 'Heartland Estate Owerri',
  fathersname: '',
  mothersname: '',
  fatherphone: '',
  motherphone: '',
  community: null,
  previousschool: '',
  regno: 'MGS/2020535',
  application_no: null,
  status: 'Admitted',
  admissiondate: 'Aug-17',
  gender: 'Male',
  studentstatus: null,
  religion: null,
  class_arm: { arm_name: 'JSS1 A' },
  country: { name: 'Nigeria' },
  state: { name: 'Abuja Federal Capital Territor' },
  lga: null,
  user: { username: 'chukd5@outlook.com' },
  department: { name: 'JSS 1' },
} as never

test('the register reads the student off the row', () => {
  const row = studentRow(student)
  assert.equal(row.id, '10')
  assert.equal(row.adm, 'MGS/2020535')
  assert.equal(row.name, 'Aniegbokas Chukwudi')
  assert.equal(row.arm, 'JSS1 A')
  assert.equal(row.status, 'Admitted')
  // Nothing on the student record says whether they owe.
  assert.equal(row.fees, '—')
})

test('the record panel reads what only the detail endpoint expands', () => {
  const row = studentRow(student)
  assert.equal(row.class, 'JSS 1')
  assert.equal(row.email, 'chukd5@outlook.com')
  assert.equal(row.address, 'Heartland Estate Owerri')
  assert.equal(row.username, 'chukd5@outlook.com')
  assert.equal(row.admitted, 'Aug-17')
})

test('where the student came from is however much of it the school holds', () => {
  assert.equal(studentRow(student).origin, 'Abuja Federal Capital Territor · Nigeria')
  const placed = { ...(student as object), community: 'Obinze' } as never
  assert.equal(studentRow(placed).origin, 'Obinze · Abuja Federal Capital Territor · Nigeria')
})

test('a guardian is shown with the number to reach them on', () => {
  const row = studentRow(student)
  assert.equal(row.father, '—')
  const withFather = {
    ...(student as object),
    fathersname: 'Mr O. Udoye',
    fatherphone: '0803 441 2280',
  } as never
  assert.equal(studentRow(withFather).father, 'Mr O. Udoye · 0803 441 2280')
  assert.equal(studentRow(withFather).parent, 'Mr O. Udoye')
})

test('the join timestamp is written as a date, and so is the birthday', () => {
  assert.equal(studentRow(student).enrolled, '27 Aug 2026')
  assert.equal(studentRow(student).born, '10 Nov 1986')
})

test('once enrolled it is the enrolment status that shows, not the admission one', () => {
  const active = { ...(student as object), studentstatus: 'Active' } as never
  assert.equal(studentRow(active).status, 'Active')
})

test('an applicant with no admission number is known by their application', () => {
  const applicant = { ...(student as object), regno: null, application_no: 'NETPRO/APP202616' } as never
  assert.equal(studentRow(applicant).adm, 'NETPRO/APP202616')
})

test('the arm falls back to the class when no arm has been allocated', () => {
  const unplaced = { ...(student as object), class_arm: undefined } as never
  assert.equal(studentRow(unplaced).arm, 'JSS 1')
})

test('an invoice reads as a line on the fees tab', () => {
  const invoice = {
    id: 41,
    invoiceid: 'TSS1/16',
    amount: '120000',
    paystatus: 'Unpaid',
    fee: { id: 3, name: 'Tuition — SS' },
  } as never

  assert.deepEqual(invoiceRow(invoice), {
    id: '41',
    invoice: 'TSS1/16',
    fee: 'Tuition — SS',
    amount: '₦120,000',
    state: 'Unpaid',
  })
})

test('an invoice the API sends no amount for shows a blank, not a zero', () => {
  const empty = { id: 41, invoiceid: 'TSS1/16', amount: null, paystatus: 'Unpaid' } as never
  assert.equal(invoiceRow(empty).amount, '—')
  assert.equal(invoiceRow(empty).fee, '—')
})

test('a result is read whichever way the endpoint spells its columns', () => {
  const nested = { id: 7, subject: { name: 'Mathematics' }, total: 78, grade: 'A' } as never
  assert.deepEqual(resultRow(nested, 0), { id: '7', subject: 'Mathematics', total: '78', grade: 'A' })

  const flat = { subject_name: 'English Language', totalscore: 72, gradename: 'B' } as never
  assert.deepEqual(resultRow(flat, 1), {
    id: 'result-1',
    subject: 'English Language',
    total: '72',
    grade: 'B',
  })
})

test('the parent column names the linked household', () => {
  const linked = { ...(student as object), sparent_id: 7 } as never
  const guardians = new Map([['7', 'Emmanuel Udo & Chidinma Udo']])
  assert.equal(studentRow(linked, guardians).parent, 'Emmanuel Udo & Chidinma Udo')
})

test('a student linked to no household falls back to the typed-in parent', () => {
  const typed = { ...(student as object), sparent_id: null, fathersname: 'Mr O. Udoye' } as never
  assert.equal(studentRow(typed, new Map()).parent, 'Mr O. Udoye')
})

test('a household the directory does not name does not blank the column', () => {
  const stale = { ...(student as object), sparent_id: 99, mothersname: 'Mrs J. Nwosu' } as never
  assert.equal(studentRow(stale, new Map([['7', 'Someone else']])).parent, 'Mrs J. Nwosu')
})

test('the register still reads without a directory at all', () => {
  const linked = { ...(student as object), sparent_id: 7, fathersname: 'Mr O. Udoye' } as never
  assert.equal(studentRow(linked).parent, 'Mr O. Udoye')
})

test('the suspend button offers the state the student is not in', () => {
  const active = suspendAction('Active')
  assert.equal(active.label, 'Suspend')
  assert.equal(active.next, 'Suspended')
  assert.equal(active.done, 'suspended')

  const suspended = suspendAction('Suspended')
  assert.equal(suspended.label, 'Reinstate')
  assert.equal(suspended.next, 'Active')
  assert.equal(suspended.done, 'reinstated')
})

test('a student with no enrolment word on them can still be suspended', () => {
  // The list endpoint leaves `studentstatus` null on some records, so the row
  // falls back to the admission word. Only "Suspended" reverses the button.
  assert.equal(suspendAction('Admitted').label, 'Suspend')
  assert.equal(suspendAction('—').next, 'Suspended')
})

test('a birthday is carried twice — to read, and for the picker', () => {
  const row = studentRow(student)
  assert.equal(row.born, '10 Nov 1986')
  assert.equal(row.dob, '1986-11-10')
})

test('a student enrolled through this form fills the picker too', () => {
  // This is the bug: `studentBody` sends YYYY-MM-DD, so every student the office
  // created here came back spelled that way and the edit form opened on an
  // empty picker — with the birthday sitting on the panel beside it.
  const own = { ...(student as object), dob: '2012-01-09' } as never
  assert.equal(studentRow(own).dob, '2012-01-09')
  assert.equal(studentRow(own).born, '09 Jan 2012')
})

test('a birthday stamped with a time is still just the day', () => {
  const stamped = { ...(student as object), dob: '2012-01-09T00:00:00+01:00' } as never
  assert.equal(studentRow(stamped).dob, '2012-01-09')
})

test('a student with no birthday on file leaves the picker empty, not on today', () => {
  assert.equal(studentRow({ ...(student as object), dob: null } as never).dob, '')
  assert.equal(studentRow({ ...(student as object), dob: null } as never).born, '—')
  // Anything that is neither spelling is left alone rather than guessed at.
  assert.equal(studentRow({ ...(student as object), dob: '1986' } as never).dob, '')
  assert.equal(studentRow({ ...(student as object), dob: '1986' } as never).born, '1986')
})

test('a single-digit day and month are padded, so the picker can read them', () => {
  assert.equal(studentRow({ ...(student as object), dob: '2/8/2026' } as never).dob, '2026-08-02')
})

test('a settled invoice reads Paid on the fees tab, as it does everywhere else', () => {
  const paid = invoiceRow({ id: 2450, invoiceid: 'TSS1/16', amount: '30000', paystatus: 'success', fee: { name: 'TUITION FEE' } } as never)
  assert.equal(paid.state, 'Paid')
  assert.equal(paid.amount, '₦30,000')
  // Anything the API has not taught us is shown as it sent it.
  const owing = invoiceRow({ id: 1, invoiceid: 'X/1', amount: '100', paystatus: 'Unpaid', fee: { name: 'BUS' } } as never)
  assert.equal(owing.state, 'Unpaid')
})
