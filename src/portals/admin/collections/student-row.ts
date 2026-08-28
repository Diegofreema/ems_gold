import type { Invoice } from '../../../api/invoices/types.ts'
import type { Student, StudentResult } from '../../../api/students/types.ts'
import { BLANK } from '../../../features/collections/blank.ts'
import type { Row } from '../../../features/collections/types.ts'
import { formatDate, formatNaira } from '../../../lib/format.ts'

function text(value: string | null | undefined): string {
  return value?.trim() || BLANK
}

/** Joins the parts a record actually carries, e.g. "Mr O. Udoye · 0803 441 2280". */
function joined(...parts: (string | null | undefined)[]): string {
  return parts.map((part) => part?.trim()).filter(Boolean).join(' · ') || BLANK
}

/** A foreign key as a select's value. A missing or zero id is no choice at all. */
function id(value: number | null | undefined): string {
  return value ? String(value) : ''
}

/** An ISO timestamp as the design writes dates. Anything else is left alone. */
function asDate(value: string | null | undefined): string {
  if (!value) return BLANK
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : formatDate(date)
}

/**
 * A pupil, as both the register and their own record read them. The list
 * endpoint expands fewer relations than the detail one, so the fields only
 * `GET /students/{id}` answers for come back blank in the table — which never
 * shows them anyway.
 *
 * `fees` stays blank throughout: whether a pupil owes is `GET /users/fees/{id}`,
 * one request per pupil, so the column waits for an endpoint that answers for
 * a page at a time.
 */
export function studentRow(student: Student): Row {
  return {
    id: String(student.id),
    adm: text(student.regno ?? student.application_no),
    name: text([student.fname, student.mname, student.lname].filter(Boolean).join(' ')),
    arm: text(student.class_arm?.arm_name ?? student.department?.name),
    // Neither parent's name is on the pupil record; only `sparent_id` is.
    parent: text(student.fathersname || student.mothersname),
    fees: BLANK,
    // `status` is where they are in admission — every enrolled pupil reads
    // "Admitted". `studentstatus` is the one that says Active or Suspended.
    status: text(student.studentstatus ?? student.status),

    // Everything below is read by the record panel rather than the table.
    class: text(student.department?.name),
    gender: text(student.gender),
    dob: text(student.dob),
    religion: text(student.religion),
    email: text(student.email),
    phone: text(student.phone),
    address: text(student.address),
    origin: joined(student.community, student.state?.name, student.country?.name),
    school: text(student.previousschool),
    father: joined(student.fathersname, student.fatherphone),
    mother: joined(student.mothersname, student.motherphone),
    admitted: text(student.admissiondate),

    // The edit form is keyed as the endpoint is, and prefills from here. Ids
    // are blank rather than "0" where the school has not set one, so a select
    // opens empty instead of on a class that does not exist.
    fname: student.fname ?? '',
    lname: student.lname ?? '',
    mname: student.mname ?? '',
    department_id: id(student.department_id),
    class_arm_id: id(student.class_arm_id),
    sparent_id: id(student.sparent_id),
    studentstatus: student.studentstatus ?? '',
    // `status` above is whichever of the two says something; this is the
    // admission word itself, which is what the endpoint takes.
    admission: student.status ?? '',
    enrolled: asDate(student.joindate),
    username: text(student.user?.username),
  }
}

/**
 * Reads the first of these keys the record actually carries. The endpoints
 * below answer with `Record<string, unknown>` for their nested rows, so the
 * spelling is read rather than assumed.
 */
function pick(record: Record<string, unknown> | undefined, ...keys: string[]): string {
  for (const key of keys) {
    const value = record?.[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number') return String(value)
  }
  return ''
}

/** An amount the API sends as a string, written the way the design shows money. */
function naira(amount: string | null | undefined): string {
  const parsed = Number(amount)
  return amount && !Number.isNaN(parsed) ? formatNaira(parsed) : BLANK
}

/** One line of a pupil's fees tab, from `GET /students/{id}/invoices`. */
export function invoiceRow(invoice: Invoice): Row {
  return {
    id: String(invoice.id),
    invoice: text(invoice.invoiceid),
    fee: text(pick(invoice.fee, 'name', 'feename', 'fee_name', 'title')),
    amount: naira(invoice.amount),
    state: text(invoice.paystatus),
  }
}

/**
 * One line of a pupil's results tab, from `GET /students/{id}/results`.
 *
 * That endpoint is typed `Record<string, unknown>` because no response has
 * been seen yet, so each cell is read by trying the spellings this API uses
 * elsewhere. A row it cannot name still gets a stable key from its position.
 */
export function resultRow(result: StudentResult, index: number): Row {
  const record = result as Record<string, unknown>

  return {
    id: pick(record, 'id') || `result-${index}`,
    subject: text(
      pick(record.subject as Record<string, unknown>, 'name', 'subject_name') ||
        pick(record, 'subject_name', 'subject'),
    ),
    total: text(pick(record, 'total', 'totalscore', 'score', 'mark')),
    grade: text(pick(record, 'grade', 'gradename', 'remark')),
  }
}
