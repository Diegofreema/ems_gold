import { createFileRoute } from '@tanstack/react-router'
import {
  setAssignments,
  setQuestions,
  setSubmissions,
} from '@/db/collections/set-assignments'
import { assignments } from '@/portals/teacher/collections/assignments'
import { CollectionPage } from '@/portals/teacher/components/collection-page'

export const Route = createFileRoute('/teacher/assignments')({
  staticData: { title: 'Set assignments', crumb: 'Assessment' },
  // Fire and forget: the record's tabs read the questions and submissions
  // sets, which fan out per assignment and sync when this page wants them
  // rather than with the shell.
  loader: () => {
    for (const set of [setAssignments, setQuestions, setSubmissions]) {
      void set.preload().catch(() => undefined)
    }
  },
  component: () => <CollectionPage definition={assignments} />,
})
