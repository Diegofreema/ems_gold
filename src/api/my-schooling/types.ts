import type { Student } from '../students/types'

export type { Student }

/**
 * Contact details only. regno, class, level, session, status and application
 * number are refused, so a pupil cannot move class, re-admit themselves or
 * lift a suspension.
 */
export type UpdateMyRecordBody = {
  phone?: string
  address?: string
}

export type StudentDashboard = Record<string, unknown>
export type Course = Record<string, unknown>
export type CourseMaterial = Record<string, unknown>

export type MyResultParams = {
  session_id?: number
  semester_id?: number
}
