import type { PageParams } from '../types.ts'
import type { Student } from '../students/types.ts'

/** A stream a class is split into — JSS 1 A, JSS 1 B. */
export type ClassArm = {
  id: number
  department_id: number
  arm_name: string
  arm_description: string | null
  class_teacher_id: number | null
  status: ClassArmStatus
  dependencies?: Record<string, number>
}

export type ClassArmStatus = 'active' | 'inactive' | 'archived'

export type ClassArmListParams = PageParams & {
  department_id?: number
  status?: ClassArmStatus
  q?: string
}

/** Classes, teachers and the three valid statuses. */
export type ClassArmOptions = Record<string, unknown>

/**
 * `arm_name` is at most 10 characters and unique within the class. An empty
 * `class_teacher_id` is stored as null; an unrecognised status defaults to
 * active.
 */
export type ClassArmBody = {
  department_id?: number
  arm_name: string
  arm_description?: string
  class_teacher_id?: number | ''
  status?: ClassArmStatus
}

export type ArmStudents = {
  students: Student[]
  /** Admitted pupils of the same class not yet placed in any arm. */
  unassigned_in_class: Student[]
}

/**
 * Each id is judged separately; the response reports what was assigned and
 * what failed. A pupil may only join an arm of their own class.
 */
export type AssignStudentsBody = {
  student_ids: number[]
}

export type AssignStudentsResult = {
  assigned: number[]
  failed: { student_id: number; reason: string }[]
}

/** Names only — this feed is open to any signed-in user. */
export type ArmOption = {
  id: number
  arm_name: string
  department?: string
}
