import type { Role, User } from '../users/types.ts'

export type LoginBody = {
  /** The account's username — a reg number for pupils, an email for staff. */
  username: string
  password: string
}

/**
 * Which kind of person the login belongs to, as the API spells it. This — not
 * the role name — is what decides the portal: `role_name` is free text a
 * school can rename ("Super Admin"), while this is one of a fixed set.
 */
export type ProfileType = 'admin' | 'teacher' | 'student' | 'sparent'

/** The signed-in account plus whichever role record hangs off it. */
export type Account = {
  user: User
  role?: Role
  profile_type?: ProfileType
  /** The admin / teacher / student / guardian record itself. */
  profile?: unknown
  /** Came back empty on every response seen so far, so left unnarrowed. */
  warnings?: unknown[]
}

/** Login answers with the whole account, so nothing else has to be asked for. */
export type LoginResult = Account & {
  token: string
  /** ISO timestamp; the token lasts 12 hours. */
  expires: string
}

export type CurrentUser = Account

export type ForgotPasswordBody = {
  /** The address the OTP is emailed to. */
  username: string
}

/** Step 1 hands back the id step 2 needs. */
export type ForgotPasswordResult = {
  user_id: number
}

export type VerifyOtpBody = {
  user_id: number
  otp_code: string
}

/** Single-use, 15-minute ticket. A user_id alone cannot reset a password. */
export type VerifyOtpResult = {
  ticket: string
}

export type ResetPasswordBody = {
  user_id: number
  ticket: string
  password: string
  confirm_password: string
}

/** For the emailed verification-key links, which carry no OTP. */
export type ChangePasswordBody = {
  key: string
  password: string
}
