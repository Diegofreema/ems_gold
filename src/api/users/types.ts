import type { Id, PageParams } from '../types.ts'

/** A login account. Every portal's person hangs off one of these. */
export type User = {
  id: number
  username: string
  role_id: number
  fname: string
  lname: string
  mname: string | null
  gender: string | null
  address: string | null
  country_id: number | null
  state_id: number | null
  phone: string | null
  department_id: number | null
  profile: string | null
  dob: string | null
  created_date: string
  created_by: number
  passport: string | null
  useruniquid: string | null
  userstatus: UserStatus
  role?: Role
}

/** The API spells these two exactly; anything else is refused. */
export type UserStatus = 'Enabled' | 'Disabled'

export type Role = {
  id: number
  role_name: string
}

export type Privilege = {
  id: number
  name: string
}

/** The office record behind an admin login. */
export type Admin = {
  id: number
  user_id: number
  surname: string
  lastname: string
  status: string
  date_created: string
  adminphoto: string | null
  gender: string | null
  department_id: number | null
  phone: string | null
  address: string | null
  dob: string | null
  profile: string | null
  privileges?: Privilege[]
  department?: { id: number; name: string; deptcode: string }
  user?: User
}

export type UserListParams = PageParams & {
  /** Matches username, first or last name. */
  q?: string
}

export type CreateUserBody = {
  username: string
  password: string
  role_id: number
  fname: string
  lname: string
  gender?: string
  address?: string
  country_id?: number
  state_id?: number
  phone?: string
  department_id?: number
}

export type SetUserStatusBody = {
  id: Id
  status: UserStatus
}

/**
 * The admin profile form. `passport` is the photo upload, so this goes out as
 * multipart rather than JSON.
 */
export type UpdateProfileBody = {
  surname?: string
  lastname?: string
  gender?: string
  phone?: string
  address?: string
  profile?: string
  passport?: File
}

export type UpdateAdminBody = UpdateProfileBody & {
  dob?: string
  role_id?: number
}

/** Admin home counters plus the revenue and transaction graphs. */
export type UsersDashboard = Record<string, unknown>

export type StudentFeeStatus = {
  student_id: number
  paid_count: number
  outstanding: boolean
}
