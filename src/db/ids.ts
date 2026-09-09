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

  refClasses: 'reference.classes',
  refClassCensus: 'reference.class-census',
  refArms: 'reference.arms',
  refSubjects: 'reference.subjects',
  refFees: 'reference.fees',
  refSessions: 'reference.sessions',
  refTerms: 'reference.terms',
  refRoles: 'reference.roles',
  refMethods: 'reference.payment-methods',
  refBooks: 'reference.books',
  refTeachers: 'reference.teachers',
  refStudents: 'reference.students',
  refGuardians: 'reference.guardians',
  refParents: 'reference.parents',
  refAdmins: 'reference.admins',
  refAudiences: 'reference.audiences',
  refNotices: 'reference.notices',
  refLoans: 'reference.loans',

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
  postNotice: 'notices.post',
  editNotice: 'notices.edit',
  removeNotice: 'notices.remove',
  createSession: 'calendar.createSession',
  renameSession: 'calendar.renameSession',
  removeSession: 'calendar.removeSession',
  createTerm: 'calendar.createTerm',
  renameTerm: 'calendar.renameTerm',
  removeTerm: 'calendar.removeTerm',
  createArm: 'academics.createArm',
  updateArm: 'academics.updateArm',
  removeArm: 'academics.removeArm',
  createSubject: 'academics.createSubject',
  updateSubject: 'academics.updateSubject',
  removeSubject: 'academics.removeSubject',
  setSubjectStatus: 'academics.setSubjectStatus',
  setCurrentSession: 'calendar.setCurrentSession',
  setCurrentTerm: 'calendar.setCurrentTerm',
  createFee: 'finance.createFee',
  updateFee: 'finance.updateFee',
  removeFee: 'finance.removeFee',
  setFeeStatus: 'finance.setFeeStatus',
  createClass: 'academics.createClass',
  updateClass: 'academics.updateClass',
  removeClass: 'academics.removeClass',
  enrolStudent: 'students.enrol',
  updateStudent: 'students.update',
  setStudentStanding: 'students.setStanding',
  createParent: 'parents.create',
  updateParent: 'parents.update',
  removeParent: 'parents.remove',
  setParentAccess: 'parents.setAccess',
  createTeacher: 'staff.createTeacher',
  updateTeacher: 'staff.updateTeacher',
  removeTeacher: 'staff.removeTeacher',
  createAdmin: 'staff.createAdmin',
  updateAdmin: 'staff.updateAdmin',
  removeAdmin: 'staff.removeAdmin',
  setLogin: 'staff.setLogin',
} as const
