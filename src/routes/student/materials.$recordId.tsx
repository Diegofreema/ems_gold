import { createFileRoute, notFound } from '@tanstack/react-router'
import { materials } from '@/portals/student/collections/learning'
import { MaterialViewer } from '@/portals/student/features/materials/material-viewer'

export const Route = createFileRoute('/student/materials/$recordId')({
  loader: ({ params }) => {
    const material = materials.rows?.find((row) => row.id === params.recordId)
    if (!material) throw notFound()
    return {
      material,
      heading: { title: material.title, crumb: 'Learning · Course materials', crumbTo: { to: '/student/materials' } },
    }
  },
  component: MaterialViewerRoute,
})

/*
 * `useLoaderData()` is briefly undefined when this route is already mounted and
 * the next navigation's loader throws `notFound()` — React renders the
 * component once more before the not-found boundary takes over. Bailing out of
 * that render keeps the 404 clean instead of crashing into the error boundary.
 */
function MaterialViewerRoute() {
  const loaded = Route.useLoaderData()
  if (!loaded) return null
  return <MaterialViewer material={loaded.material} />
}
