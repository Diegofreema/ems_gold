import { createFileRoute } from '@tanstack/react-router'
import { CollectionPage } from '@/portals/student/components/collection-page'
import { library } from '@/portals/student/collections/library'

export const Route = createFileRoute('/student/library')({
  staticData: { title: 'My books', crumb: 'Learning' },
  component: () => <CollectionPage definition={library} />,
})
