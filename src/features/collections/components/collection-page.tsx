import { Suspense } from 'react'
import { ListSkeleton } from '@/components/feedback/list-skeleton'
import type { CollectionDef, CollectionRoutes } from '../types'
import { CollectionList } from './collection-list'

/**
 * Renders any collection as the design's list page, showing the shimmer
 * skeleton while the rows load.
 */
export function CollectionPage({
  definition,
  routes,
}: {
  definition: CollectionDef
  routes: CollectionRoutes
}) {
  return (
    <Suspense
      key={definition.id}
      fallback={<ListSkeleton label={definition.title.toLowerCase()} />}
    >
      <CollectionList definition={definition} routes={routes} />
    </Suspense>
  )
}
