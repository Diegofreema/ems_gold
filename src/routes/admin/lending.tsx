import { createFileRoute } from '@tanstack/react-router'
import { CollectionPage } from '@/portals/admin/components/collection-page'
import { library } from '@/portals/admin/collections/loans'

export const Route = createFileRoute('/admin/lending')({
  staticData: { title: 'Lending', crumb: 'School' },
  component: () => <CollectionPage definition={library} />,
})
