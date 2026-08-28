import { createFileRoute } from '@tanstack/react-router'
import { children } from '@/portals/parent/collections'
import { CollectionPage } from '@/portals/parent/components/collection-page'

export const Route = createFileRoute('/parent/children/')({
  staticData: { title: 'My children', crumb: 'My children' },
  component: () => <CollectionPage definition={children} />,
})
