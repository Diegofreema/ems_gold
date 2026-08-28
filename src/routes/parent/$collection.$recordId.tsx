import { createFileRoute, notFound } from '@tanstack/react-router'
import { loadRecord } from '@/features/collections/resolve'
import { CHILDREN } from '@/portals/parent/children'
import { parentCollections } from '@/portals/parent/collections'
import { CollectionDetail } from '@/portals/parent/components/collection-detail'

export const Route = createFileRoute('/parent/$collection/$recordId')({
  /**
   * A record is looked up across every child, not just the selected one, so a
   * shared link opens even when the switcher is on the other child. The
   * definition returned is the one the record actually belongs to.
   */
  loader: ({ params }) => {
    for (const child of CHILDREN) {
      const loaded = loadRecord(
        parentCollections(child),
        params.collection,
        params.recordId,
      )
      if (loaded) return loaded
    }
    throw notFound()
  },
  component: RecordDetail,
})

function RecordDetail() {
  const { definition, record } = Route.useLoaderData()
  return <CollectionDetail definition={definition} record={record} />
}
