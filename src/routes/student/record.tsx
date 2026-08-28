import { createFileRoute } from '@tanstack/react-router'
import { CollectionPage } from '@/portals/student/components/collection-page'
import { record } from '@/portals/student/collections/finance'

export const Route = createFileRoute('/student/record')({
  staticData: { title: 'My record', crumb: 'Finance' },
  component: () => <CollectionPage definition={record} />,
})
