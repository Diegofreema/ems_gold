export type Position = {
  id: number
  name: string
}

export type Candidate = Record<string, unknown>

export type PositionBody = {
  name: string
}

export type CandidateBody = {
  student_id: number
  position_id: number
  session_id: number
}

/** Only the position can be changed once a candidate stands. */
export type EditCandidateBody = {
  position_id: number
}

/** Both filters are optional; the session defaults to the current one. */
export type VoteParams = {
  position_id?: number
  session_id?: number
}

export type VoteTally = Record<string, unknown>
