import { createFileRoute } from '@tanstack/react-router'
import { TestReceipt } from '@/portals/student/features/test/test-receipt'

export const Route = createFileRoute('/student/test/receipt')({
  staticData: { title: 'Test submitted', crumb: 'Assessment · Take a test' },
  validateSearch: (search: Record<string, unknown>) => ({
    answered: Number(search.answered) || 0,
  }),
  component: Receipt,
})

function Receipt() {
  return <TestReceipt answered={Route.useSearch().answered} />
}
