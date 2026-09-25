/**
 * `POST /students/apply` — a family applying for a place, from the sign-in
 * page, with no account. Every key below is the request as the school gave
 * it (2026-09-25), with the public lookups documented beside it in the
 * "Applying - public, no token" folder; nothing here has been read back off a
 * live answer yet, and on 2026-09-25 bronze did not yet serve the lookups.
 *
 * Sent whole, with an empty string where the family left a box empty, because
 * that is the transcript: `email` goes as `""`.
 */
/** A row of any of the three public lookups: the id and what it is called. */
export type NamedRow = { id: number; name: string }

export type ApplicationBody = {
  fname: string
  lname: string
  mname: string
  /** YYYY-MM-DD. */
  dob: string
  gender: string
  address: string
  phone: string
  /**
   * The class applied into. Required by the endpoint — an application without
   * one is refused — and offered from the public `GET /departments`.
   */
  department_id: number
  /** Required by the school (`students.state_id` is NOT NULL). */
  state_id?: number
  /** Optional: the school defaults it to its own country. */
  country_id?: number
  /** The one optional place — `students.lga_id` is nullable. */
  lga_id?: number
  /** The previous school. The admin form's `previousschool`, under this name. */
  pschools: string
  religion: string
  /** The student's own, which a child very often does not have. */
  email: string
  fathersname: string
  mothersname: string
  fatherphone: string
  motherphone: string
  fathersjob: string
  mothersjob: string
  /** The household's address — how the school answers the family. */
  pemailaddress: string
  /**
   * The same three documents the office attaches at enrolment, under the same
   * names. Any one of them sends the application as multipart.
   */
  passport?: File
  birth_certificate?: File
  other_certificates?: File
}
