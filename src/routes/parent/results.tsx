import { createFileRoute } from '@tanstack/react-router'
import { resultsFor } from '@/portals/parent/collections'
import { CollectionPage } from '@/portals/parent/components/collection-page'
import { useSelectedChild } from '@/portals/parent/parent.store'

export const Route = createFileRoute('/parent/results')({
  staticData: { title: 'Results', crumb: 'My children' },
  component: ResultsList,
})

function ResultsList() {
  return <CollectionPage definition={resultsFor(useSelectedChild())} />
}
