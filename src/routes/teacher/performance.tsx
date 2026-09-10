import { createFileRoute } from '@tanstack/react-router'
import { TeacherPerformancePage } from '@/portals/teacher/features/performance/teacher-performance-page'

export const Route = createFileRoute('/teacher/performance')({
  staticData: { title: 'Performance', crumb: 'Assessment' },
  component: TeacherPerformancePage,
})
