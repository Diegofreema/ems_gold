import type { ClassArm } from '../../../api/class-arms/types.ts'
import type { Student } from '../../../api/students/types.ts'
import type { Subject } from '../../../api/subjects/types.ts'
import { BLANK } from '../../../features/collections/blank.ts'
import type { Row } from '../../../features/collections/types.ts'

/** The id-to-name lookups a register needs for keys its list does not expand. */
export type Names = ReadonlyMap<string, string>

function text(value: string | null | undefined): string {
  return value?.trim() || BLANK
}

/** A foreign key as a select's value. A missing or zero id is no choice at all. */
function id(value: number | null | undefined): string {
  return value ? String(value) : ''
}

/** Reads a name out of a feed, or reads blank — never "undefined". */
function named(names: Names | undefined, key: number | null | undefined): string {
  return (key && names?.get(String(key))) || BLANK
}

/** The API lower-cases its statuses; the register does not. */
export function titleCase(value: string | null | undefined): string {
  const word = value?.trim()
  return word ? word[0].toUpperCase() + word.slice(1) : BLANK
}

/**
 * How many rows point at this one. Only the detail endpoint sends it, so the
 * register reads whichever count is there and stays blank on the list.
 */
function dependency(
  dependencies: Record<string, number> | undefined,
  ...keys: string[]
): string {
  for (const key of keys) {
    const count = dependencies?.[key]
    if (typeof count === 'number') return String(count)
  }
  return BLANK
}

/**
 * One class arm — a teachable group inside a class.
 *
 * The list endpoint sends ids for the class and the form teacher and no names
 * with them, so both are read from the feeds the forms already use. `subjects`
 * has no per-arm answer at all: a subject belongs to a class, and every arm of
 * that class takes it.
 */
export function armRow(arm: ClassArm, classes?: Names, teachers?: Names): Row {
  return {
    id: String(arm.id),
    arm: text(arm.arm_name),
    klass: named(classes, arm.department_id),
    teacher: named(teachers, arm.class_teacher_id),
    roll: dependency(arm.dependencies, 'students', 'class_arm_students'),
    status: titleCase(arm.status),

    // Read by the record panel rather than the table.
    description: text(arm.arm_description),

    // The edit form is keyed as the endpoint is, and prefills from here.
    arm_name: arm.arm_name ?? '',
    arm_description: arm.arm_description ?? '',
    department_id: id(arm.department_id),
    class_teacher_id: id(arm.class_teacher_id),
    // Title-cased, because that is how the form's options are spelled and a
    // value that matches none of them prefills as no choice at all. The body
    // builder lower-cases it again on the way back out.
    armstatus: arm.status ? titleCase(arm.status) : '',
  }
}

/** The API spells a subject's status as a number rather than a word. */
export function subjectStatus(status: number | null | undefined): string {
  return status ? 'Active' : 'Inactive'
}

/**
 * One subject. `department_id` is its home class — the one it can never stop
 * being taught to; `POST /subjects/{id}/classes` adds the others, and the list
 * endpoint does not say which those are.
 */
export function subjectRow(subject: Subject, classes?: Names): Row {
  const teachers = subject.teachers ?? []
  return {
    id: String(subject.id),
    code: text(subject.subjectcode),
    name: text(subject.name),
    klass: named(classes, subject.department_id),
    teachers: String(teachers.length),
    status: subjectStatus(subject.status),

    // Read by the record panel rather than the table.
    credit: subject.creditload === null ? BLANK : String(subject.creditload ?? BLANK),
    staff:
      teachers
        .map((teacher) => [teacher.firstname, teacher.lastname].filter(Boolean).join(' '))
        .filter(Boolean)
        .join(', ') || BLANK,

    // `name` above is both the cell and the form's value: a subject cannot
    // exist without one, so the two never disagree.
    subjectcode: subject.subjectcode ?? '',
    department_id: id(subject.department_id),
    creditload: subject.creditload === null ? '' : String(subject.creditload ?? ''),
  }
}

/**
 * One line of an arm's pupils tab, from `GET /class-arms/{id}/students`. That
 * endpoint answers with two lists — who is in the arm, and who is admitted
 * into the class but not yet placed anywhere. Both belong on the page, so the
 * row says which it is rather than reading as one roll of pupils who are here.
 */
export function armPupilRow(student: Student, placed: boolean): Row {
  return {
    id: String(student.id),
    name: text([student.fname, student.mname, student.lname].filter(Boolean).join(' ')),
    adm: text(student.regno ?? student.application_no),
    placed: placed ? 'In this arm' : 'Not placed',
    status: text(student.studentstatus ?? student.status),
  }
}

/** One line of a subject's teachers tab, off the record the detail expands. */
export function subjectTeacherRow(teacher: {
  id: number
  firstname: string
  lastname: string
}): Row {
  return {
    id: String(teacher.id),
    name: text([teacher.firstname, teacher.lastname].filter(Boolean).join(' ')),
  }
}
