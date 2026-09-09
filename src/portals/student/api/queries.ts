import { queryOptions } from '@tanstack/react-query'
import { assignmentKeys } from '@/api/assignments/keys'
import { assignmentsService } from '@/api/assignments/service'

/**
 * What is left on the query path in the pupil's portal.
 *
 * Everything a page *lists* is a set on the device now — see
 * `src/db/collections/schooling.ts`. These two are deliberately not: they are
 * the answers a sitting turns on, and a stale copy of either would put a pupil
 * into an assignment they cannot send back. See `attempt.ts`.
 */

/**
 * `GET /assignments/{id}` — one assignment and its questions.
 *
 * Never cached: this is the answer that says whether the assignment has been
 * submitted and whether its window is still open, and a stale copy of either
 * would put a student into an assignment they cannot send back.
 */
export const studentAssignmentQuery = (setassignmentId: string) =>
  queryOptions({
    queryKey: assignmentKeys.detail(setassignmentId),
    queryFn: () => assignmentsService.get(setassignmentId),
    staleTime: 0,
  })

/** `GET /assignments/results/{id}` — keyed on the submission, not the assignment. */
export const studentAssignmentResultQuery = (submissionId: string) =>
  queryOptions({
    queryKey: assignmentKeys.result(submissionId),
    queryFn: () => assignmentsService.result(submissionId),
  })
