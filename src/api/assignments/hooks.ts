import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Id } from '../types'
import { assignmentKeys } from './keys'
import { assignmentsService } from './service'
import type { SubmitAssignmentBody } from './types'

export function useAssignments(subjectId?: number) {
  return useQuery({
    queryKey: assignmentKeys.list(subjectId),
    queryFn: () => assignmentsService.list(subjectId),
  })
}

export function useAssignment(setassignmentId: Id | undefined) {
  return useQuery({
    queryKey: assignmentKeys.detail(setassignmentId ?? ''),
    queryFn: () => assignmentsService.get(setassignmentId!),
    enabled: setassignmentId !== undefined,
    // A sat paper must not be served from cache on a re-entry.
    staleTime: 0,
  })
}

/** Submitting closes the paper, so the list's `my_status` is stale. */
export function useSubmitAssignment(setassignmentId: Id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: SubmitAssignmentBody) =>
      assignmentsService.submit(setassignmentId, body),
    meta: { success: 'Assignment submitted' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assignmentKeys.all }),
  })
}

export function useAssignmentResult(assignmentId: Id | undefined) {
  return useQuery({
    queryKey: assignmentKeys.result(assignmentId ?? ''),
    queryFn: () => assignmentsService.result(assignmentId!),
    enabled: assignmentId !== undefined,
  })
}

export function useAssignmentSubmissions(setassignmentId: Id | undefined) {
  return useQuery({
    queryKey: assignmentKeys.submissions(setassignmentId ?? ''),
    queryFn: () => assignmentsService.submissions(setassignmentId!),
    enabled: setassignmentId !== undefined,
  })
}

export function useAssignmentSubmission(assignmentId: Id | undefined) {
  return useQuery({
    queryKey: assignmentKeys.submission(assignmentId ?? ''),
    queryFn: () => assignmentsService.submission(assignmentId!),
    enabled: assignmentId !== undefined,
  })
}
