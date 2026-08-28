import { createFileRoute } from '@tanstack/react-router'
import { testsFor } from '@/portals/parent/collections'
import { CollectionPage } from '@/portals/parent/components/collection-page'
import { useSelectedChild } from '@/portals/parent/parent.store'

export const Route = createFileRoute('/parent/tests')({
  staticData: { title: 'Tests for my children', crumb: 'Tests' },
  component: TestsList,
})

function TestsList() {
  return <CollectionPage definition={testsFor(useSelectedChild())} />
}
