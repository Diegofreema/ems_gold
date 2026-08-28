import { createFileRoute, notFound } from '@tanstack/react-router'
import { CollectionDetail } from '@/portals/teacher/components/collection-detail'
import { loadRecord } from '@/portals/teacher/collections/resolve'

export const Route = createFileRoute('/teacher/$collection/$recordId/')({
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
