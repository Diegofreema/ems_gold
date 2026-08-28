import type { PageParams } from '../types'

/** Reference rows that feed the attendance filter UI. */
export type AttendanceDepartment = {
  id: number
  name: string
  deptcode?: string
}

export type AttendanceClassArm = {
  id: number
  name: string
  department_id: number
}

/** Today's headcount per department, split by arm where arms exist. */
export type AttendanceDashboard = Record<string, unknown>

export type AttendanceReportParams = PageParams & {
  department_id?: number
  class_arm_id?: number
  /** YYYY-MM-DD. */
  start_date?: string
  end_date?: string
  status?: string
}

/** The CSV export takes the report's filters minus paging and arm. */
export type AttendanceExportParams = Omit<
  AttendanceReportParams,
  'page' | 'limit' | 'class_arm_id'
>

export type AttendanceRecord = Record<string, unknown>

export type AttendanceReport = {
  records: AttendanceRecord[]
  totals?: Record<string, number>
}
