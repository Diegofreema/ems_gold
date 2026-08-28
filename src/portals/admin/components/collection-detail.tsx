import { CollectionDetail as SharedCollectionDetail } from '@/features/collections/components/collection-detail'
import type { CollectionDef, Row } from '@/features/collections/types'
import { adminFlows } from '../features/actions/defs'
import { adminCollectionRoutes } from '../collections/routes'

export function CollectionDetail({
  definition,
  record,
}: {
  definition: CollectionDef
  record: Row
}) {
  return (
    <SharedCollectionDetail
      definition={definition}
      record={record}
      routes={adminCollectionRoutes}
      flow={adminFlows[definition.id]}
    />
  )
}
