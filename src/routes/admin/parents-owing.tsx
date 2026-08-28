import { createFileRoute } from '@tanstack/react-router'
import { CollectionPage } from '@/portals/admin/components/collection-page'
import { parentsOwing } from '@/portals/admin/collections/parents'

export const Route = createFileRoute('/admin/parents-owing')({
  staticData: { title: 'Parents owing', crumb: 'Parents' },
  component: () => <CollectionPage definition={parentsOwing} />,
})
