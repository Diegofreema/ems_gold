import { createFileRoute } from '@tanstack/react-router'
import { CollectionPage } from '@/portals/admin/components/collection-page'
import { elections } from '@/portals/admin/collections/school'

export const Route = createFileRoute('/admin/elections')({
  staticData: { title: 'Prefect elections', crumb: 'School' },
  component: () => <CollectionPage definition={elections} />,
})
