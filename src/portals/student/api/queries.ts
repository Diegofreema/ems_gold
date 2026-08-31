import { queryOptions } from '@tanstack/react-query'
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
