import { createFileRoute } from '@tanstack/react-router'
import { CollectionPage } from '@/portals/admin/components/collection-page'
import { attendance } from '@/portals/admin/collections/students'

export const Route = createFileRoute('/admin/attendance')({
  staticData: { title: 'Attendance', crumb: 'Students' },
  component: () => <CollectionPage definition={attendance} />,
})
