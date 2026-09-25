import { bodyOrForm, request } from '../client'
import type { ApplicationBody } from './types'

/**
 * What a family can ask the school before they have an account. None of these
 * takes a token, and a signed-out device sends none.
 *
 * The three lookups answer with whatever envelope their controller chose —
 * only `/departments` was documented with its answer (`{departments: [...]}`)
 * — so they come back unread and `namedRows` in `features/admission` reads them.
 */
export const admissionsService = {
  /** The classes a family can apply into: `id` and `name` alone, anonymously. */
  classes: () => request<unknown>('departments'),

  /** The states of the school's own country. */
  states: () => request<unknown>('states'),

  /** The local government areas of one state. Optional on an application. */
  lgas: (stateId: number) => request<unknown>('lgas', { query: { state_id: stateId } }),

  /** The answer's shape has not been seen — `applicationReference` reads it. */
  apply: (body: ApplicationBody) =>
    request<unknown>('students/apply', { method: 'POST', ...bodyOrForm(body) }),
}
