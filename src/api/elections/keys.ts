import type { VoteParams } from './types'

export const electionKeys = {
  all: ['elections'] as const,
  positions: () => [...electionKeys.all, 'positions'] as const,
  candidates: (sessionId?: number) => [...electionKeys.all, 'candidates', sessionId] as const,
  votes: (params: VoteParams) => [...electionKeys.all, 'votes', params] as const,
}
