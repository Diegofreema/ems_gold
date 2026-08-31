import type { MyCourse } from '../../../../api/my-schooling/types.ts'
import type { Row } from '../../../../features/collections/types.ts'
import { text } from '../../../../features/profile/record.ts'

/**
 * The subjects the pupil is registered for, off `GET /students/me/courses`.
 *
 * Four columns where the design has five. "Periods / wk" is the timetable's,
 * and there is no timetable on this API at all — no route, not even a shut
 * one. "CA so far" is a mark, and marks have their own page: the results
 * endpoint is the school's approved record of them, and a second copy here
 * would be a number a pupil could read two ways.
 */

/** Who teaches a subject, however many of them there are. */
export function teachersOf(course: MyCourse): string {
  const names = (course.teachers ?? [])
    .map((teacher) => teacher?.name?.trim())
    .filter(Boolean)
  return names.length ? names.join(', ') : text(null)
}

/**
 * By name rather than by id. A subject list is not a chronology — a pupil
 * scans it for one subject, and the alphabet is where they look first.
 */
function byName(courses: MyCourse[]): MyCourse[] {
  return [...courses].sort((a, b) => nameOf(a).localeCompare(nameOf(b)))
}

/** A subject that was sent without its name is still nameable by its id. */
function nameOf(course: MyCourse): string {
  return course.name?.trim() || `Subject ${course.id}`
}

export function courseRows(courses: MyCourse[]): Row[] {
  return byName(courses).map((course) => ({
    id: String(course.id),
    code: text(course.subjectcode),
    name: nameOf(course),
    klass: text(course.department?.name),
    teacher: teachersOf(course),
  }))
}
