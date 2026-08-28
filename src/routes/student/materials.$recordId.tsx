import { createFileRoute, notFound } from '@tanstack/react-router'
import { materials } from '@/portals/student/collections/learning'
import { MaterialViewer } from '@/portals/student/features/materials/material-viewer'

export const Route = createFileRoute('/student/materials/$recordId')({
  loader: ({ params }) => {
    const material = materials.rows.find((row) => row.id === params.recordId)
    if (!material) throw notFound()
    return {
      material,
      heading: { title: material.title, crumb: 'Learning · Course materials' },
    }
  },
  component: MaterialViewerRoute,
})

function MaterialViewerRoute() {
  return <MaterialViewer material={Route.useLoaderData().material} />
}
