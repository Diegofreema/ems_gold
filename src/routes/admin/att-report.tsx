import { createFileRoute } from '@tanstack/react-router'
import { AttendanceReport } from '@/portals/admin/features/attendance-report'

export const Route = createFileRoute('/admin/att-report')({
  staticData: { title: 'Attendance report', crumb: 'Students' },
  component: AttendanceReport,
})
