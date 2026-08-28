import { Suspense } from 'react'
import { ListSkeleton } from '@/components/feedback/list-skeleton'
import type { CollectionDef, CollectionRoutes, FlowSpec } from '../types'
import { CollectionList } from './collection-list'

/**
 * Renders any collection as the design's list page, showing the shimmer
 * skeleton while the rows load.
 */
export function CollectionPage({
  definition,
  routes,
  flow,
}: {
  definition: CollectionDef
  routes: CollectionRoutes
  flow?: FlowSpec
}) {
  return (
    <Suspense
      key={definition.id}
      fallback={<ListSkeleton label={definition.title.toLowerCase()} />}
    >
      <CollectionList definition={definition} routes={routes} flow={flow} />
    </Suspense>
  )
}
