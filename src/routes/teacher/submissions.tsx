import { createFileRoute } from '@tanstack/react-router'
import { pageSearch } from '@/lib/search'
import { SubmissionsPage } from '@/portals/teacher/features/assignments/submissions-page'

export const Route = createFileRoute('/teacher/submissions')({
  // Which assignment is being marked, and whose paper is open. Both are what
  // the page opens on, so a row of the register can lead straight to a script.
  validateSearch: pageSearch(['assignment', 'submission']),
  staticData: {
    title: 'Marking',
    crumb: 'Assessment · Set assignments',
    crumbTo: '/teacher/assignments',
  },
  component: SubmissionsPage,
})
