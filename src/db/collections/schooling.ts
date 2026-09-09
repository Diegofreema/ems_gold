import { assignmentsService } from '@/api/assignments/service'
import type { Assignment } from '@/api/assignments/types'
import { registerService } from '@/api/attendance/service'
import type { MyAttendance } from '@/api/attendance/types'
import { libraryService } from '@/api/library/service'
import type { Loan } from '@/api/library/types'
import { mySchoolingService } from '@/api/my-schooling/service'
import type { MyCourses, MyInvoices, MyMaterial, StudentDashboard } from '@/api/my-schooling/types'
import { resultsService } from '@/api/results/service'
import type { MyMarks } from '@/api/results/types'
import { timetablesService } from '@/api/timetables/service'
import type { ClassTimetable } from '@/api/timetables/types'
import { schoolCollection, schoolDocument } from '../collection'
import { SET } from '../ids'

/**
 * Everything a pupil's own portal reads, on the pupil's own device.
 *
 * Every endpoint here resolves the caller from the token — `students/me/*`,
 * `results/mine`, `attendances/mine`, `loanedbooks/mine`, `timetables/mine` —
 * so a device only ever holds the record of whoever signed in on it. No other
 * child's marks, bills or attendance can reach it.
 *
 * Several of these are documents rather than lists, and deliberately kept
 * whole: the fee ledger is the bills *and* the payments taken against them, the
 * course list carries the class and term the registration was made against, and
 * the mark sheet carries the term average the school worked out. Storing only
 * the list would throw away exactly what the panel beside it reads.
 */

/** The five counters on the pupil's home page. */
export const schoolingStats = schoolDocument<StudentDashboard>({
  id: SET.schoolingStats,
  fetch: () => mySchoolingService.dashboard(),
  schemaVersion: 1,
})

/** Subjects registered for, with the class, session and term beside them. */
export const schoolingCourses = schoolDocument<MyCourses>({
  id: SET.schoolingCourses,
  fetch: () => mySchoolingService.courses(),
  schemaVersion: 1,
})

/** The bills and the payments taken against them, in one answer. */
export const schoolingInvoices = schoolDocument<MyInvoices>({
  id: SET.schoolingInvoices,
  fetch: () => mySchoolingService.invoices(),
  schemaVersion: 1,
})

/** Released marks, every term at once, with the term average beside them. */
export const schoolingResults = schoolDocument<MyMarks>({
  id: SET.schoolingResults,
  fetch: () => resultsService.mine(),
  schemaVersion: 1,
})

/** Every day somebody took a register on this pupil, with the school's own rate. */
export const schoolingAttendance = schoolDocument<MyAttendance>({
  id: SET.schoolingAttendance,
  fetch: () => registerService.mine(),
  schemaVersion: 1,
})

/** The week as the school runs it, with the class it was drawn for. */
export const schoolingTimetable = schoolDocument<ClassTimetable>({
  id: SET.schoolingTimetable,
  fetch: () => timetablesService.mine(),
  schemaVersion: 1,
})

/** Files shared with the pupil's class. Empty school-wide, and legitimately so. */
export const schoolingMaterials = schoolCollection<MyMaterial, number>({
  id: SET.schoolingMaterials,
  fetch: () => mySchoolingService.materials(),
  getKey: (material) => material.id,
  schemaVersion: 1,
})

/** The pupil's own borrowings. */
export const schoolingLoans = schoolCollection<Loan, number>({
  id: SET.schoolingLoans,
  fetch: () => libraryService.myLoans(),
  getKey: (loan) => loan.id,
  schemaVersion: 1,
})

/**
 * Assignments set for the pupil's own arm.
 *
 * Kept like everything else, and read with one eye open: `my_status` and
 * `window_problem` are worked out by the school against its own clock, so an
 * assignment this device says is open may have closed while the device was
 * away. Sitting one still needs `/assignments/{id}`, which is deliberately
 * never cached — see `attempt.ts`.
 */
export const schoolingAssignments = schoolCollection<Assignment, number>({
  id: SET.schoolingAssignments,
  fetch: () => assignmentsService.list(),
  getKey: (assignment) => assignment.id,
  schemaVersion: 1,
})

/** Everything the pupil's portal keeps on the device. */
export const schoolingCollections = [
  schoolingStats,
  schoolingCourses,
  schoolingInvoices,
  schoolingResults,
  schoolingAttendance,
  schoolingTimetable,
  schoolingMaterials,
  schoolingLoans,
  schoolingAssignments,
]
