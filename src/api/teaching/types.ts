import type { PageParams } from '../types'
import type { Teacher } from '../teachers/types'

export type { Teacher }

/** Photo and CV are file rows; role, subjects and grade cannot be changed here. */
export type UpdateMyTeachingProfileBody = {
  phone?: string
  address?: string
  passports?: File
  ccv?: File
}

export type TeacherDashboard = Record<string, unknown>
export type TeacherSubject = Record<string, unknown>
export type TeacherStudent = Record<string, unknown>
export type EClass = Record<string, unknown>

/** `subject_id` is required; the rest narrow the cohort. */
export type RegisteredStudentParams = {
  subject_id: number
  session_id?: number
  semester_id?: number
  level_id?: number
}

export type MessageAdminBody = {
  subject: string
  message: string
}

/** An empty `student_ids` mails the caller's whole department. */
export type MessageStudentsBody = MessageAdminBody & {
  student_ids: number[]
}

/**
 * A results spreadsheet. Columns are A regno, B CA, C 1st exam, D 2nd exam,
 * E 3rd exam. The batch lands as `pending` for admin approval.
 */
export type UploadResultsBody = {
  result: File
  department_id: number
  subject_id: number
  semester_id: number
  session_id: number
  class_arm_id: number
}

/** Which batch to open — the four ids that group an upload. */
export type UploadBatchKey = {
  subjectId: number
  departmentId: number
  semesterId: number
  sessionId: number
}

export type UploadBatch = Record<string, unknown>
export type ResultRow = Record<string, unknown>

export type MyResultParams = PageParams & {
  subject_id?: number
  session_id?: number
  semester_id?: number
}

/** CA is capped at 40 and exam at 60; grade and remark are derived server-side. */
export type EnterScoreBody = {
  student_id: number
  subject_id: number
  session_id: number
  semester_id: number
  ca: number
  exam: number
}

export type Topic = {
  id: number
  subject_id: number
  title: string
  contents: string
}

export type CreateTopicBody = {
  subject_id: number
  title: string
  contents: string
}

export type UpdateTopicBody = Partial<Omit<CreateTopicBody, 'subject_id'>>
