/**
 * What each set on the device is called.
 *
 * Here rather than inline because two things far apart have to agree on the
 * spelling: the collection itself, and the outbox handler that names the set to
 * refetch once a queued write lands. The handlers cannot import the collections
 * — they are registered at boot, and importing them there would build every
 * portal's sets for every visitor and drag them all into the first load — so
 * without this the agreement would be two string literals hoping to match.
 *
 * An id names the SQLite table and the query key, so renaming one orphans
 * whatever is already on somebody's device.
 */
export const SET = {
  parentChildren: 'parent.children',
  parentInvoices: 'parent.invoices',
  parentAttendance: 'parent.attendance',

  teachingSubjects: 'teaching.subjects',
  teachingStudents: 'teaching.students',
  teachingArms: 'teaching.arms',
  teachingResults: 'teaching.results',
  teachingTopics: 'teaching.topics',
  teachingEClasses: 'teaching.eclasses',

  schoolingStats: 'schooling.stats',
  schoolingCourses: 'schooling.courses',
  schoolingMaterials: 'schooling.materials',
  schoolingAssignments: 'schooling.assignments',
  schoolingResults: 'schooling.results',
  schoolingAttendance: 'schooling.attendance',
  schoolingInvoices: 'schooling.invoices',
  schoolingLoans: 'schooling.loans',
  schoolingTimetable: 'schooling.timetable',

  registerArms: 'attendance.arms',
  registerStatuses: 'attendance.statuses',
  registerDays: 'attendance.days',
} as const

/**
 * What each queued write is called.
 *
 * A name is written into every op and read back by a later page load, so it is
 * as permanent as the set ids above — renaming one strands whatever is already
 * in somebody's queue, which is somebody's afternoon.
 *
 * Here, beside the ids and away from the handlers themselves, so that the pure
 * logic which has to recognise a queued write — the register sheet drawing
 * marks it is still holding — can name one without importing the module that
 * sends it, and with it every service in the app.
 */
export const WRITE = {
  takeRegister: 'attendance.take',
  enterScore: 'teaching.enterScore',
  addTopic: 'teaching.addTopic',
  updateTopic: 'teaching.updateTopic',
} as const
