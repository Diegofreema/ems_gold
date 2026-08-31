import { createFileRoute } from '@tanstack/react-router'
import { studentPaperQuery } from '@/portals/student/api/queries'
import { TestPage } from '@/portals/student/features/tests/test-page'

export const Route = createFileRoute('/student/tests/$testId/')({
  staticData: { title: 'Take a test', crumb: 'Assessment · Tests open to me', crumbTo: '/student/tests' },
  // Fetched here so the page never suspends into an empty shell: a pupil about
  // to sit a paper should see the paper, not a flash of nothing.
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(studentPaperQuery(params.testId)),
  component: Paper,
})

function Paper() {
  return <TestPage testId={Route.useParams().testId} />
}
