import { createFileRoute } from '@tanstack/react-router'
import { StudentLookupPage } from '@/portals/admin/features/collect-student/student-page'

export const Route = createFileRoute('/admin/collect/student')({
  staticData: { title: 'Find a student', crumb: 'Finance · Fee collection', crumbTo: '/admin/collect' },
  component: StudentLookupPage,
})
