import type { PageParams } from '../types.ts'

/** A guardian record. The API calls the table `sparents`. */
export type Parent = {
  id: number
  user_id: number
  fathersname: string | null
  mothersname: string | null
  pemailaddress: string | null
  fatherphone: string | null
  motherphone: string | null
  fathersjob: string | null
  mothersjob: string | null
  address: string | null
  occupation: string | null
  status: ParentStatus
  username?: string
}

export type ParentStatus = 'active' | 'deactivated'

export type ParentListParams = PageParams & {
  status?: ParentStatus
  /** Matches either parent's name, the email or the father's phone. */
  q?: string
}

/** A child as the parent screens see them — a slim view of the pupil record. */
export type Child = {
  id: number
  regno: string | null
  fname: string
  lname: string
  mname: string | null
  gender: string | null
  studentstatus: string | null
  department_id: number | null
  department: string | null
  class_arm: string | null
}

/**
 * Creates the guardian record and the login behind it, and returns the
 * username with its default password. A failed guardian save rolls the login
 * back.
 */
export type ParentBody = {
  fathersname?: string
  mothersname?: string
  pemailaddress?: string
  address?: string
  fatherphone?: string
  motherphone?: string
  fathersjob?: string
  mothersjob?: string
}

export type ParentDashboard = Record<string, unknown>

export type ChildResultParams = {
  session_id?: number
  semester_id?: number
}

/** Dates are YYYY-MM-DD and default to the current month. */
export type ChildAttendanceParams = {
  start_date?: string
  end_date?: string
}

/** Each child with the tests set for their class and their status on each. */
export type ChildAssignment = Record<string, unknown>

/**
 * Question id to answer: an option id for multiple choice, free text for
 * theory. An option belonging to another question is discarded, and
 * re-submitting a completed test is a 409.
 */
export type SubmitAnswersBody = {
  answers: Record<string, number | string>
}
