import { createFileRoute } from '@tanstack/react-router'
import { CollectionPage } from '@/portals/admin/components/collection-page'
import { parentsInvited } from '@/portals/admin/collections/parents'

export const Route = createFileRoute('/admin/parents-invited')({
  staticData: { title: 'Not yet signed up', crumb: 'Parents' },
  component: () => <CollectionPage definition={parentsInvited} />,
})
