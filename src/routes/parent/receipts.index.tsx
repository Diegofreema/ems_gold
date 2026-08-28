import { createFileRoute } from '@tanstack/react-router'
import { receipts } from '@/portals/parent/collections'
import { CollectionPage } from '@/portals/parent/components/collection-page'

export const Route = createFileRoute('/parent/receipts/')({
  staticData: { title: 'Receipts', crumb: 'Finance' },
  component: () => <CollectionPage definition={receipts} />,
})
