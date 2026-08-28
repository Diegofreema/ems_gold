import { createFileRoute, notFound } from '@tanstack/react-router'
import { CollectionDetail } from '@/portals/student/components/collection-detail'
import { loadRecord } from '@/portals/student/collections/resolve'

export const Route = createFileRoute('/student/$collection/$recordId')({
  loader: ({ params }) => {
    const loaded = loadRecord(params.collection, params.recordId)
    if (!loaded) throw notFound()
    return loaded
  },
  component: RecordDetail,
})

function RecordDetail() {
  const { definition, record } = Route.useLoaderData()
  return <CollectionDetail definition={definition} record={record} />
}
