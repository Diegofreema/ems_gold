import { createFileRoute } from '@tanstack/react-router'
import { ResultsPage } from '@/portals/admin/features/results/results-page'

export const Route = createFileRoute('/admin/results')({
  staticData: { title: 'Results', crumb: 'Academics' },
  component: ResultsPage,
})
