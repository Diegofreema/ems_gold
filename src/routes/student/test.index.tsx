import { createFileRoute } from '@tanstack/react-router'
import { TestPage } from '@/portals/student/features/test/test-page'

export const Route = createFileRoute('/student/test/')({
  staticData: { title: 'Take a test', crumb: 'Assessment' },
  component: TestPage,
})
