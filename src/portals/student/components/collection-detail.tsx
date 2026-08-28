import { CollectionDetail as SharedCollectionDetail } from '@/features/collections/components/collection-detail'
import type { CollectionDef, Row } from '@/features/collections/types'
import { studentCollectionRoutes } from '../collections/routes'

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
      routes={studentCollectionRoutes}
    />
  )
}
