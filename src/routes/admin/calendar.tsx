import { createFileRoute } from '@tanstack/react-router'
import { CollectionPage } from '@/portals/admin/components/collection-page'
import { calendar } from '@/portals/admin/collections/academics'

export const Route = createFileRoute('/admin/calendar')({
  staticData: { title: 'Sessions & terms', crumb: 'Academics' },
  component: () => <CollectionPage definition={calendar} />,
})
