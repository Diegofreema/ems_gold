import type { MyCourses } from '../../../../api/my-schooling/types.ts'
import type { ClassTimetable, Period } from '../../../../api/timetables/types.ts'
import type { Row } from '../../../../features/collections/types.ts'
import { weekPeriods } from '../../../../features/collections/timetable.ts'
import { text } from '../../../../features/profile/record.ts'
import { teachersOf } from '../courses/courses.ts'

/**
 * The pupil's week, off `GET /timetables/mine`.
 *
 * Four columns where the design has five. "Room" is the one dropped: the
 * period carries `where`, `venue` and `lecturehall_id` and all three are null
 * on every period this school holds. A room number is the one thing on this
 * page that would send a pupil to the wrong door, so it is left out rather
 * than filled with a dash down the whole column.
 *
 * "Teacher" is not on a period either, but it is knowable: a period names its
 * `subject_id`, and `GET /students/me/courses` numbers its subjects the same
 * way — course 1 is subject 1, ENGLISH LANGUAGE, on both. So the two answers
 * are joined here and the teacher is the school's own, not a guess.
 */

/** Who teaches the subject this period is for, by subject id. */
export function teacherFor(period: Period, courses: MyCourses): string {
  const course = (courses.courses ?? []).find((entry) => entry.id === period.subject_id)
  return course ? teachersOf(course) : text(null)
}

/**
 * "08:00 – 08:40". Both times are the school's wall clock, sent without a zone
 * and without seconds, so they are printed as they arrive.
 */
export function timeRange(period: Period): string {
  const from = period.start_time?.trim()
  const to = period.end_time?.trim()
  if (from && to) return `${from} – ${to}`
  return text(from || to || null)
}

/** The subject, or the school's own title where a period has no subject. */
export function labelOf(period: Period): string {
  return period.label?.trim() || period.subject_name?.trim() || period.title?.trim() || text(null)
}

/** The class the timetable is for, arm and all — the same pair as My subjects. */
export function classOf(timetable: ClassTimetable): string {
  const parts = [timetable.class?.name?.trim(), timetable.class_arm?.trim()].filter(Boolean)
  return parts.length ? parts.join(' · ') : text(null)
}

export function periodRows(timetable: ClassTimetable, courses: MyCourses): Row[] {
  const klass = classOf(timetable)

  return weekPeriods(timetable).map((period) => ({
    id: String(period.id),
    day: text(period.day_of_week),
    time: timeRange(period),
    subject: labelOf(period),
    teacher: teacherFor(period, courses),

    // Read by the record panel rather than the table.
    klass,
    session: text(timetable.session?.name),
    term: text(timetable.semester?.name),
  }))
}
