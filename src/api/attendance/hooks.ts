import { useMutation, useQuery } from '@tanstack/react-query'
import { attendanceKeys } from './keys'
import { attendanceService } from './service'
import type { AttendanceExportParams, AttendanceReportParams } from './types'

export function useAttendanceDashboard(date?: string) {
  return useQuery({
    queryKey: attendanceKeys.dashboard(date),
    queryFn: () => attendanceService.dashboard(date),
  })
}

export function useAttendanceReport(params: AttendanceReportParams = {}) {
  return useQuery({
    queryKey: attendanceKeys.report(params),
    queryFn: () => attendanceService.report(params),
  })
}

export function useAttendanceDepartments() {
  return useQuery({
    queryKey: attendanceKeys.departments(),
    queryFn: () => attendanceService.departments(),
    staleTime: Infinity,
  })
}

export function useAttendanceClassArms(departmentId?: number) {
  return useQuery({
    queryKey: attendanceKeys.classArms(departmentId),
    queryFn: () => attendanceService.classArms(departmentId),
    staleTime: Infinity,
  })
}

/** A download, not a cache entry — hence a mutation. */
export function useExportAttendanceCsv() {
  return useMutation({
    mutationFn: (params: AttendanceExportParams = {}) => attendanceService.exportCsv(params),
  })
}
