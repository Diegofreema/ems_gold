import { createFileRoute } from '@tanstack/react-router'
import { setAssignments, setQuestions } from '@/db/collections/set-assignments'
import { pageSearch } from '@/lib/search'
import { QuestionsPage } from '@/portals/teacher/features/assignments/questions-page'

export const Route = createFileRoute('/teacher/questions')({
  // Which assignment's questions are being written.
  validateSearch: pageSearch(['assignment']),
  // Fire and forget, like every portal loader: the sets fan out per
  // assignment and are synced by the pages that read them, not by the shell.
  loader: () => {
    for (const set of [setAssignments, setQuestions]) {
      void set.preload().catch(() => undefined)
    }
  },
  staticData: {
    title: 'Write the questions',
    crumb: 'Assessment · Set assignments',
    crumbTo: '/teacher/assignments',
  },
  component: QuestionsPage,
})
