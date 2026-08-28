import { CollectionDetail as SharedCollectionDetail } from '@/features/collections/components/collection-detail'
import type { CollectionDef, Row } from '@/features/collections/types'
import { teacherCollectionRoutes } from '../collections/routes'

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
      routes={teacherCollectionRoutes}
    />
  )
}
