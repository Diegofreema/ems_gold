import { paginated, request, requestBlob } from '../client'
import type {
  AttendanceClassArm,
  AttendanceDashboard,
  AttendanceDepartment,
  AttendanceExportParams,
  AttendanceRecord,
  AttendanceReportParams,
} from './types'

export const attendanceService = {
  /** Optional `date` is YYYY-MM-DD; absent means today. */
  dashboard: (date?: string) =>
    request<AttendanceDashboard>('admin-attendances', { query: { date } }),

  report: (params: AttendanceReportParams = {}) =>
    request<Record<string, unknown>>('admin-attendances/report', {
      query: { ...params },
    }).then((data) => paginated<AttendanceRecord>(data, 'records')),

  /** Same filters as the report, handed back as a CSV file. */
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
