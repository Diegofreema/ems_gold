import { createFileRoute, notFound } from '@tanstack/react-router'
import { uploads } from '@/portals/teacher/collections/assessment'
import { BatchReview } from '@/portals/teacher/features/uploads/batch-review'

export const Route = createFileRoute('/teacher/uploads/$recordId')({
  loader: ({ params }) => {
    const batch = uploads.rows.find((row) => row.id === params.recordId)
    if (!batch) throw notFound()
    return {
      batch,
      heading: { title: batch.batch, crumb: 'Assessment · Upload batches' },
    }
  },
  component: BatchReviewRoute,
})

/*
 * `useLoaderData()` is briefly undefined when this route is already mounted and
 * the next navigation's loader throws `notFound()` — React renders the
 * component once more before the not-found boundary takes over. Bailing out of
 * that render keeps the 404 clean instead of crashing into the error boundary.
 */
function BatchReviewRoute() {
  const loaded = Route.useLoaderData()
  if (!loaded) return null
  return <BatchReview batch={loaded.batch} />
}
