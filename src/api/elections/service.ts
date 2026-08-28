import { request } from '../client'
import type { Id } from '../types'
import type {
  Candidate,
  CandidateBody,
  EditCandidateBody,
  Position,
  PositionBody,
  VoteParams,
  VoteTally,
} from './types'

export const electionsService = {
  positions: () =>
    request<{ positions: Position[] }>('admins/positions').then((data) => data.positions),

  addPosition: (body: PositionBody) =>
    request<{ position: Position }>('admins/positions', { method: 'POST', body }),

  updatePosition: (id: Id, body: PositionBody) =>
    request<{ position: Position }>(`admins/positions/${id}`, { method: 'POST', body }),

  /** Defaults to the current session when `session_id` is left off. */
  candidates: (sessionId?: number) =>
    request<{ candidates: Candidate[] }>('admins/candidates', {
      query: { session_id: sessionId },
    }).then((data) => data.candidates),

  addCandidate: (body: CandidateBody) =>
    request<{ candidate: Candidate }>('admins/candidates', { method: 'POST', body }),

  updateCandidate: (id: Id, body: EditCandidateBody) =>
    request<{ candidate: Candidate }>(`admins/candidates/${id}`, { method: 'POST', body }),

  votes: (params: VoteParams = {}) =>
    request<VoteTally>('admins/votes', { query: { ...params } }),
}
