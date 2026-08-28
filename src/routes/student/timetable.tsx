import { createFileRoute } from '@tanstack/react-router'
import { CollectionPage } from '@/portals/student/components/collection-page'
import { timetable } from '@/portals/student/collections/learning'

export const Route = createFileRoute('/student/timetable')({
  staticData: { title: 'My timetable', crumb: 'Learning' },
  component: () => <CollectionPage definition={timetable} />,
})
