import { createFileRoute } from '@tanstack/react-router'
import { CollectionPage } from '@/portals/admin/components/collection-page'
import { parentsCleared } from '@/portals/admin/collections/parents'

export const Route = createFileRoute('/admin/parents-cleared')({
  staticData: { title: 'Parents cleared', crumb: 'Parents' },
  component: () => <CollectionPage definition={parentsCleared} />,
})
