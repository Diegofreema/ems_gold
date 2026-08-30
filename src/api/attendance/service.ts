import { request, requestBlob } from '../client'
import type {
  AttendanceClassArm,
  AttendanceDashboard,
  AttendanceDepartment,
  AttendanceExportParams,
  AttendanceReport,
  AttendanceReportParams,
} from './types'

export const attendanceService = {
  /** Optional `date` is YYYY-MM-DD; absent means today. */
  dashboard: (date?: string) =>
    request<AttendanceDashboard>('admin-attendances', { query: { date } }),

  /**
   * The whole payload, not just the page. `stats` counts the range rather than
   * the page, and `filters` says which dates the endpoint actually used where
   * none were given — both are on screen, so neither can be thrown away here.
   */
  report: (params: AttendanceReportParams = {}) =>
    request<AttendanceReport>('admin-attendances/report', { query: { ...params } }),

  /** Same filters as the report, arm included, handed back as a CSV file. */
  exportCsv: (params: AttendanceExportParams = {}) =>
    requestBlob('admin-attendances/export', { query: { ...params } }),

  departments: () =>
    request<{ departments: AttendanceDepartment[] }>('admin-attendances/departments').then(
      (data) => data.departments,
    ),

  /** Active arms only, optionally narrowed to one department. */
  classArms: (departmentId?: number) =>
    request<{ class_arms: AttendanceClassArm[] }>('admin-attendances/class-arms', {
      query: { department_id: departmentId },
    }).then((data) => data.class_arms),
}
