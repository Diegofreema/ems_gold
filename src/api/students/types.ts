import type { PageParams } from '../types'

/** A pupil record. Applicants are the same row with `status: 'Applied'`. */
export type Student = {
  id: number
  user_id: number | null
  fname: string
  lname: string
  mname: string | null
  dob: string | null
  gender: string | null
  email: string | null
  phone: string | null
  address: string | null
  regno: string | null
  application_no: string | null
  joindate: string | null
  admissiondate: string | null
  department_id: number | null
  level_id: number | null
  faculty_id: number | null
  state_id: number | null
  country_id: number | null
  lga_id: number | null
  community: string | null
  previousschool: string | null
  fathersname: string | null
  mothersname: string | null
  fatherphone: string | null
  motherphone: string | null
  fathersjob: string | null
  mothersjob: string | null
  /** Where they are in admission: Applied, Admitted, … */
  status: string | null
  /** Where they are once admitted: Active, Suspended, … */
  studentstatus: string | null
  passporturl: string | null
  olevelresulturl: string | null
  birthcerturl: string | null
  othercerts: string | null
  jamb: string | null
  jambregno: string | null
  jambresult: string | null
  jamb_notification: string | null
  jamb_admin_letter: string | null
}

export type StudentListParams = PageParams & {
  status?: string
  studentstatus?: string
  department_id?: number
  class_arm_id?: number
  session_id?: number
  level_id?: number
  /** Name, regno, email or application number. */
  q?: string
}

export type StudentBody = {
  fname: string
  lname: string
  mname?: string
  /** YYYY-MM-DD. */
  dob?: string
  email?: string
  gender?: string
  department_id?: number
  session_id?: number
  status?: string
  studentstatus?: string
  address?: string
  phone?: string
  class_arm_id?: number | string
  sparent_id?: number | string
  religion?: string
}

/** The API accepts exactly these two words. */
export type SetStudentStatusBody = {
  status: 'Active' | 'Suspended'
}

/** Moves the listed pupils into a class, and into an arm if one is given. */
export type PromoteStudentsBody = {
  student_ids: number[]
  department_id: number
  class_arm_id?: number
}

export type StudentResultParams = {
  session_id?: number
  semester_id?: number
}

export type StudentResult = Record<string, unknown>
