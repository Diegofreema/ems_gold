import type { PageParams } from '../types.ts'

export type Subject = {
  id: number
  name: string
  subjectcode: string
  /** The subject's home class; it may also be taught to others. */
  department_id: number
  creditload: number | null
  /** Comes back null when the row carries 0. */
  semester_id: number | null
  level_id: number | null
  status: number
  user_id: number
  teachers?: { id: number; firstname: string; lastname: string }[]
  dependencies?: Record<string, number>
}

export type SubjectListParams = PageParams & {
  department_id?: number
  /** 1 for active, 0 for inactive. */
  status?: 0 | 1
  /** Matches the name or the subject code. */
  q?: string
}

/** Classes, levels, terms and teachers for the subject forms. */
export type SubjectOptions = Record<string, unknown>

/**
 * `subjectcode` is generated from the name when left out. The name must be
 * unique within its class. On update, a field left out is untouched.
 */
export type SubjectBody = {
  name?: string
  subjectcode?: string
  department_id?: number
  creditload?: number
  semester_id?: number
  level_id?: number
  teachers?: number[]
}

/** Replaces the whole set, so `[]` clears it. */
export type AssignTeachersBody = {
  teachers: number[]
}

/**
 * Replaces the whole set. The home class is always kept whether listed or
 * not, so a subject can never end up taught to nobody.
 */
export type SetSubjectClassesBody = {
  classes: number[]
}
