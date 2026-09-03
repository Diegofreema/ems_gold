import { createFileRoute } from '@tanstack/react-router'
import { CollectionPage } from '@/portals/admin/components/collection-page'
import { books } from '@/portals/admin/collections/books'

export const Route = createFileRoute('/admin/library')({
  staticData: { title: 'Library', crumb: 'School' },
  component: () => <CollectionPage definition={books} />,
})
