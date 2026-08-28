import { createFileRoute, notFound } from '@tanstack/react-router'
import { CollectionForm } from '@/portals/teacher/components/collection-form'
import { loadRecordForEdit } from '@/portals/teacher/collections/resolve'

export const Route = createFileRoute('/teacher/$collection/$recordId/edit')({
  loader: ({ params }) => {
    const loaded = loadRecordForEdit(params.collection, params.recordId)
    if (!loaded) throw notFound()
    return loaded
  },
  component: RecordEdit,
})

function RecordEdit() {
  const { definition, record } = Route.useLoaderData()
  return <CollectionForm definition={definition} record={record} />
}
