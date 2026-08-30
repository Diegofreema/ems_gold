import type { PageParams } from '../types.ts'

/** Reference rows that feed the attendance filter UI. */
export type AttendanceDepartment = {
  id: number
  name: string
  deptcode?: string
}

/**
 * An arm as this endpoint spells it — `arm_name`, not `name`, and without the
 * class expanded, so the class it belongs to has to come from `department_id`.
 */
export type AttendanceClassArm = {
  id: number
  department_id: number
  arm_name: string
  arm_description?: string | null
  class_teacher_id?: number | null
  status?: string | null
}

/** How a day's marks break down. Every register uses these four words. */
export type AttendanceTally = {
  present: number
  absent: number
  late: number
  excused: number
}

/**
 * One teachable group on the chosen day.
 *
 * `department_name` is the class and the arm already joined — "JSS 1 - JSS1 A"
 * — and reads as the class alone where the class has no arms. `present_count`
 * is scoped to the date; a class nobody has marked and a class where everyone
 * is away both read 0, and the row cannot tell them apart.
 */
export type AttendanceClassCount = {
  department_id: number
  class_arm_id: number | null
  department_name: string
  total_students: number
  present_count: number
}

export type AttendanceDashboard = {
  /** The day answered for, which is today where none was asked for. */
  date: string
  today: AttendanceClassCount[]
  /**
   * Every attendance record the school has ever taken — NOT the day above.
   * The endpoint returns the same figures whatever `date` is asked for, so
   * this is not a day's summary and must never be shown as one.
   */
  overall: AttendanceTally & { total_records: number }
}

export type AttendanceReportParams = PageParams & {
  department_id?: number
  class_arm_id?: number
  /** YYYY-MM-DD. An empty range is the current month. */
  start_date?: string
  end_date?: string
  status?: string
}

/** The CSV export takes the report's filters minus paging. */
export type AttendanceExportParams = Omit<AttendanceReportParams, 'page' | 'limit'>

/** One mark: one pupil, one day. */
export type AttendanceRecord = {
  id: number
  /** YYYY-MM-DD. */
  attendance_date: string
  status: string
  notes?: string | null
  student: {
    id: number
    regno: string | null
    name: string
    department: string | null
    class_arm: string | null
  }
  /** Absent where the mark was not made by a member of staff on record. */
  teacher?: { id: number; name: string } | null
}

export type AttendanceReport = {
  /** Echoed back, filled in with the defaults the endpoint chose. */
  filters: {
    department_id: number | null
    class_arm_id: number | null
    start_date: string
    end_date: string
    status: string | null
  }
  /**
   * The breakdown over the range, class and arm asked for — but NOT over
   * `status`, which narrows the records alone. Asking for absences leaves
   * these four unchanged, which is what makes them a breakdown.
   */
  stats: AttendanceTally & { total: number }
  records: AttendanceRecord[]
  pagination: { page: number; limit: number; total: number; pages: number }
}
