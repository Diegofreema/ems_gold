import type { Child, Parent } from '../../../api/parents/types.ts'
import { BLANK } from '../../../features/collections/blank.ts'
import type { Row } from '../../../features/collections/types.ts'

function text(value: string | null | undefined): string {
  return value?.trim() || BLANK
}

/** Joins the parts a record actually carries, e.g. "Teacher · 0803 441 2280". */
function joined(...parts: (string | null | undefined)[]): string {
  return parts.map((part) => part?.trim()).filter(Boolean).join(' · ') || BLANK
}

/**
 * A household as one line. The API keeps a father and a mother on the same
 * record rather than a person per row, so the name is both of them where the
 * school holds both.
 */
export function parentName(parent: Pick<Parent, 'fathersname' | 'mothersname'>): string {
  return [parent.fathersname, parent.mothersname]
    .map((name) => name?.trim())
    .filter(Boolean)
    .join(' & ')
}

/** The API spells its two statuses in lower case; the register does not. */
export function parentStatus(status: string | null | undefined): string {
  const word = status?.trim()
  return word ? word[0].toUpperCase() + word.slice(1) : BLANK
}

/**
 * A guardian, as the register and their own record read them.
 *
 * `children` and `owing` stay blank: the list endpoint counts neither, and
 * both would cost a request per row to answer — the children are on the
 * record's own tab instead, where one request answers for one household.
 */
export function parentRow(parent: Parent): Row {
  const name = parentName(parent)
  return {
    id: String(parent.id),
    name: name || text(parent.pemailaddress),
    phone: text(parent.fatherphone ?? parent.motherphone),
    email: text(parent.pemailaddress),
    status: parentStatus(parent.status),

    // Read by the record panel rather than the table.
    father: joined(parent.fathersname, parent.fatherphone, parent.fathersjob),
    mother: joined(parent.mothersname, parent.motherphone, parent.mothersjob),
    address: text(parent.address),
    occupation: text(parent.occupation),
    username: text(parent.username),

    // The edit form is keyed as the endpoint is, and prefills from here.
    fathersname: parent.fathersname ?? '',
    mothersname: parent.mothersname ?? '',
    pemailaddress: parent.pemailaddress ?? '',
    fatherphone: parent.fatherphone ?? '',
    motherphone: parent.motherphone ?? '',
    fathersjob: parent.fathersjob ?? '',
    mothersjob: parent.mothersjob ?? '',
  }
}

/** One line of a guardian's children tab, from `GET /sparents/{id}/children`. */
export function childRow(child: Child): Row {
  return {
    id: String(child.id),
    name: text([child.fname, child.mname, child.lname].filter(Boolean).join(' ')),
    adm: text(child.regno),
    class: text(child.department),
    arm: text(child.class_arm),
    status: text(child.studentstatus),
  }
}
