import { createFileRoute, notFound } from '@tanstack/react-router'
import { CollectionForm } from '@/portals/admin/components/collection-form'
import { loadCollection } from '@/portals/admin/collections/resolve'

export const Route = createFileRoute('/admin/$collection/new')({
  loader: ({ params }) => {
    const loaded = loadCollection(params.collection)
    if (!loaded) throw notFound()
    return loaded
  },
  component: NewRecord,
})

function NewRecord() {
  return <CollectionForm definition={Route.useLoaderData().definition} />
}
