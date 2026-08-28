import type { PageParams } from '../types.ts'

/**
 * The table is called `departments`, but a row is a class — JSS 1, JSS II.
 * The API's name is kept so the wire and the code agree.
 */
export type Department = {
  id: number
  name: string
  deptcode: string
  faculty_id: number
  iscdl?: string
  maxunit?: number | null
  /** How many rows would break if it were deleted. */
  dependencies?: Record<string, number>
}

export type DepartmentListParams = PageParams & {
  /** Matches the name or the class code. */
  q?: string
  faculty_id?: number
}

/** Faculties, fees, levels, semesters, subjects and programmes for the forms. */
export type DepartmentOptions = Record<string, unknown>

/**
 * `deptcode` is filled from the name when left out. Association keys take
 * plain id arrays and replace the whole set.
 */
export type DepartmentBody = {
  name: string
  deptcode?: string
  fees?: number[]
  subjects?: number[]
  levels?: number[]
  semesters?: number[]
  programmes?: number[]
}

/** Adds these subjects to the class; it does not move their home class. */
export type AddSubjectsBody = {
  subjects: number[]
}

/**
 * Each key present replaces that whole set, so `[]` clears it; keys left out
 * are untouched. Sending none of the four is a 422.
 */
export type AllocateToClassBody = {
  fees?: number[]
  levels?: number[]
  semesters?: number[]
  programmes?: number[]
}

export type ClassSubject = Record<string, unknown>

/** Each arm with its class teacher and student count. */
export type ClassArmSummary = Record<string, unknown>
