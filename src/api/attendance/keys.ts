import type { AttendanceReportParams } from './types'

export const attendanceKeys = {
  all: ['attendance'] as const,
  dashboard: (date?: string) => [...attendanceKeys.all, 'dashboard', date] as const,
  report: (params: AttendanceReportParams) => [...attendanceKeys.all, 'report', params] as const,
  departments: () => [...attendanceKeys.all, 'departments'] as const,
  classArms: (departmentId?: number) =>
    [...attendanceKeys.all, 'class-arms', departmentId] as const,
}
