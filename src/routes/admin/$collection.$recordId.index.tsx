import { createFileRoute, notFound } from '@tanstack/react-router'
import { CollectionDetail } from '@/portals/admin/components/collection-detail'
import { loadRecord } from '@/portals/admin/collections/resolve'

export const Route = createFileRoute('/admin/$collection/$recordId/')({
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
