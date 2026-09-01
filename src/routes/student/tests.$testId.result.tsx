import { createFileRoute } from '@tanstack/react-router';
import {
  studentPaperQuery,
  studentTestResultQuery,
} from '@/portals/student/api/queries';
import { TestResult } from '@/portals/student/features/tests/test-result';

export const Route = createFileRoute('/student/tests/$testId/result')({
  staticData: {
    title: 'How you did',
    crumb: 'Assessment · Tests',
    crumbTo: '/student/tests',
  },
  /*
   * Both hops, warmed here. The URL names the paper and the result endpoint is
   * keyed on the submission, so the paper has to answer before the result can
   * be asked for at all — doing that in the loader keeps the page from
   * rendering twice on its way in.
   *
   * A paper that was never sat has no submission, and that is not an error:
   * the page says so itself.
   */
  loader: async ({ context, params }) => {
    const paper = await context.queryClient.ensureQueryData(
      studentPaperQuery(params.testId),
    );
    if (paper.my_submission) {
      await context.queryClient.ensureQueryData(
        studentTestResultQuery(String(paper.my_submission.id)),
      );
    }
  },
  component: Result,
});

function Result() {
  return <TestResult testId={Route.useParams().testId} />;
}
