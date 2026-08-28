import type { User } from '../users/types'

export type LoginBody = {
  /** The account's username — a reg number for pupils, an email for staff. */
  username: string
  password: string
}

export type LoginResult = {
  token: string
  /** ISO timestamp; the token lasts 12 hours. */
  expires: string
  user?: User
}

/** The signed-in account plus whichever role record hangs off it. */
export type CurrentUser = {
  user: User
  admin?: unknown
  student?: unknown
  teacher?: unknown
  sparent?: unknown
}

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
