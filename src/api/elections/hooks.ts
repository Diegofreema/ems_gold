import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Id } from '../types'
import { electionKeys } from './keys'
import { electionsService } from './service'
import type { CandidateBody, EditCandidateBody, PositionBody, VoteParams } from './types'

export function usePositions() {
  return useQuery({
    queryKey: electionKeys.positions(),
    queryFn: () => electionsService.positions(),
  })
}

export function useAddPosition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: PositionBody) => electionsService.addPosition(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: electionKeys.positions() }),
  })
}

export function useUpdatePosition(id: Id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: PositionBody) => electionsService.updatePosition(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: electionKeys.positions() }),
  })
}

export function useCandidates(sessionId?: number) {
  return useQuery({
    queryKey: electionKeys.candidates(sessionId),
    queryFn: () => electionsService.candidates(sessionId),
  })
}

export function useAddCandidate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CandidateBody) => electionsService.addCandidate(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: electionKeys.all }),
  })
}

export function useUpdateCandidate(id: Id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: EditCandidateBody) => electionsService.updateCandidate(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: electionKeys.all }),
  })
}

export function useVotes(params: VoteParams = {}) {
  return useQuery({
    queryKey: electionKeys.votes(params),
    queryFn: () => electionsService.votes(params),
  })
}
