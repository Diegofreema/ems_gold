import { queryOptions } from '@tanstack/react-query'
import { assignmentKeys } from '@/api/assignments/keys'
import { assignmentsService } from '@/api/assignments/service'
import { mySchoolingKeys } from '@/api/my-schooling/keys'
import { mySchoolingService } from '@/api/my-schooling/service'

/**
 * The two answers every pupil page is built out of. Kept together so the
 * dashboard, the sidebar and the fee register all read one cache entry each
 * rather than a copy of the same request per page.
 */

/** `GET /students/me` — the pupil's whole record, relations expanded. */
export const studentRecordQuery = queryOptions({
  queryKey: mySchoolingKeys.record(),
  queryFn: () => mySchoolingService.record(),
})

/** `GET /students/me/dashboard` — five counters and nothing else. */
export const studentStatsQuery = queryOptions({
  queryKey: mySchoolingKeys.dashboard(),
  queryFn: () => mySchoolingService.dashboard(),
})

/**
 * `GET /students/me/results` — approved marks only, every term at once. No
 * parameters: a pupil cannot name a session or a term to ask for one.
 */
export const studentResultsQuery = queryOptions({
  queryKey: mySchoolingKeys.results({}),
  queryFn: () => mySchoolingService.results(),
})

/** `GET /students/me/invoices` — settled bills only, whatever it is asked. */
export const studentInvoicesQuery = queryOptions({
  queryKey: mySchoolingKeys.invoices(),
  queryFn: () => mySchoolingService.invoices(),
})

/**
 * `GET /students/me/materials` — the files shared with the pupil's class.
 *
 * Answers `{ "materials": [] }` for every pupil: the table it reads is empty
 * across the whole school, and no endpoint on this API fills it.
 */
export const studentMaterialsQuery = queryOptions({
  queryKey: mySchoolingKeys.materials(),
  queryFn: () => mySchoolingService.materials(),
})

/**
 * `GET /students/me/courses` — the subjects the pupil is registered for.
 *
 * Answers `{ "courses": [] }` for every pupil: nobody in the school is
 * registered for a subject, and no route on this API registers anyone.
 */
export const studentCoursesQuery = queryOptions({
  queryKey: mySchoolingKeys.courses(),
  queryFn: () => mySchoolingService.courses(),
})

/**
 * `GET /assignments` — every paper set for the pupil's own class.
 *
 * Asked without a `subject_id`, which the endpoint treats as "all of them".
 * Sharing the key with `useAssignments()` so the register and anything else
 * reading the list collapse into one request.
 *
 * Not cached for long: `my_status` and `window_problem` are worked out by the
 * server against its own clock, so a paper that opened a minute ago is only
 * open once this has been asked again.
 */
export const studentTestsQuery = queryOptions({
  queryKey: assignmentKeys.list(undefined),
  queryFn: () => assignmentsService.list(),
  staleTime: 30_000,
})

/**
 * `GET /assignments/{id}` — one paper and its questions.
 *
 * Never cached: this is the answer that says whether the paper has been
 * submitted and whether its window is still open, and a stale copy of either
 * would put a pupil into a paper they cannot send back.
 */
export const studentPaperQuery = (setassignmentId: string) =>
  queryOptions({
    queryKey: assignmentKeys.detail(setassignmentId),
    queryFn: () => assignmentsService.get(setassignmentId),
    staleTime: 0,
  })

/** `GET /assignments/results/{id}` — keyed on the submission, not the paper. */
export const studentTestResultQuery = (submissionId: string) =>
  queryOptions({
    queryKey: assignmentKeys.result(submissionId),
    queryFn: () => assignmentsService.result(submissionId),
  })
