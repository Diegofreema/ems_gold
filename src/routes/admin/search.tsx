import { createFileRoute } from '@tanstack/react-router'
import { AdminSearchPage } from '@/portals/admin/features/search/search-page'

export const Route = createFileRoute('/admin/search')({
  staticData: { title: 'Search', crumb: 'School' },
  component: AdminSearchPage,
})
