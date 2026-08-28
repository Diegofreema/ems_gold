import type { PageParams } from '../types'

export type Teacher = {
  id: number
  user_id: number
  firstname: string
  lastname: string
  middlename: string | null
  gender: string | null
  address: string | null
  country_id: number | null
  state_id: number | null
  phone: string | null
  profile: string | null
  cv: string | null
  qualification: string | null
  date_created: string
  passport: string | null
  department_id: number | null
  staffgrade_id: number | null
  staffdepartment_id: number | null
  /** The API spells this Yes/No rather than as a boolean. */
  isadviser: 'Yes' | 'No'
}

export type StaffListParams = PageParams & {
  /** Matches first name, last name or username. */
  q?: string
}

/**
 * Creates the login and the staff record together. The account starts Enabled
 * on the default password, to be changed on first sign-in.
 */
export type CreateStaffBody = {
  username: string
  firstname: string
  lastname: string
  middlename?: string
  gender?: string
  address?: string
  phone?: string
  country_id?: number
  state_id?: number
  department_id?: number
  qualification?: string
  profile?: string
}

export type UpdateStaffBody = Partial<Omit<CreateStaffBody, 'username'>> & {
  /** Reassigns which arm they take. */
  class_arm_id?: number
}

/** Replaces the teacher's subject set with exactly these ids. */
export type AssignSubjectsBody = {
  subjects: number[]
}

/** An empty `user_ids` mails every member of staff. */
export type MailStaffBody = {
  user_ids: number[]
  subject: string
  message: string
}
