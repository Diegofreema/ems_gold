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
  loader: async ({ params }) => {
    for (const child of CHILDREN) {
      const loaded = await loadRecord(
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

/*
 * `useLoaderData()` is briefly undefined when this route is already mounted and
 * the next navigation's loader throws `notFound()` — React renders the
 * component once more before the not-found boundary takes over. Bailing out of
 * that render keeps the 404 clean instead of crashing into the error boundary.
 */
function RecordDetail() {
  const loaded = Route.useLoaderData()
  if (!loaded) return null
  const { definition, record } = loaded
  return <CollectionDetail definition={definition} record={record} />
}
