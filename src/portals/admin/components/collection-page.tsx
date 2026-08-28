import { Suspense } from 'react'
import { ListSkeleton } from '@/components/feedback/list-skeleton'
import type { CollectionDef } from '../collections/types'
import { CollectionList } from './collection-list'

/**
 * Renders any admin collection as the design's list page, showing the shimmer
 * skeleton while the collection loads.
 */
export function CollectionPage({ definition }: { definition: CollectionDef }) {
  return (
    <Suspense
      key={definition.id}
      fallback={<ListSkeleton label={definition.title.toLowerCase()} />}
    >
      <CollectionList definition={definition} />
    </Suspense>
  )
}
