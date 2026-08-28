import { createFileRoute } from '@tanstack/react-router'
import { CollectionPage } from '@/portals/admin/components/collection-page'
import { results } from '@/portals/admin/collections/academics'

export const Route = createFileRoute('/admin/results')({
  staticData: { title: 'Results', crumb: 'Academics' },
  component: () => <CollectionPage definition={results} />,
})
