import { createFileRoute } from '@tanstack/react-router'
import { pageSearch } from '@/lib/search'
import { QuestionsPage } from '@/portals/teacher/features/assignments/questions-page'

export const Route = createFileRoute('/teacher/questions')({
  // Which assignment's questions are being written.
  validateSearch: pageSearch(['assignment']),
  staticData: {
    title: 'Write the questions',
    crumb: 'Assessment · Set assignments',
    crumbTo: '/teacher/assignments',
  },
  component: QuestionsPage,
})
