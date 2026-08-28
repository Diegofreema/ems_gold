import { request } from '../client'
import type { Id } from '../types'
import type {
  Assignment,
  AssignmentResult,
  SubmitAssignmentBody,
  Submission,
} from './types'

export const assignmentsService = {
  /** Everything set for the caller's class this term. */
  list: (subjectId?: number) =>
    request<{ assignments: Assignment[] }>('assignments', {
      query: { subject_id: subjectId },
    }).then((data) => data.assignments),

  /** A paper set for another class is a 403. */
  get: (setassignmentId: Id) =>
    request<Record<string, unknown>>(`assignments/${setassignmentId}`),

  /**
   * Re-submitting a finished paper is a 409, and a paper outside its window
   * is refused with the reason.
   */
  submit: (setassignmentId: Id, body: SubmitAssignmentBody) =>
    request<unknown>(`assignments/${setassignmentId}/submit`, { method: 'POST', body }),

  /** The caller's own submissions only. */
  result: (assignmentId: Id) =>
    request<AssignmentResult>(`assignments/results/${assignmentId}`),

  /** For the teacher who set the paper, or an admin. 403 for anyone else. */
  submissions: (setassignmentId: Id) =>
    request<{ submissions: Submission[] }>(
      `assignments/${setassignmentId}/submissions`,
    ).then((data) => data.submissions),

  /** One submission with the marking fields attached. */
  submission: (assignmentId: Id) =>
    request<Submission>(`assignments/submissions/${assignmentId}`),
}
