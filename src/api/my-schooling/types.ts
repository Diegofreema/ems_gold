import type { Invoice } from '../invoices/types.ts'
import type { Student } from '../students/types.ts'

export type { Student }

/**
 * Contact details only. regno, class, level, session, status and application
 * number are refused, so a pupil cannot move class, re-admit themselves or
 * lift a suspension.
 */
export type UpdateMyRecordBody = {
  phone?: string
  address?: string
}

/**
 * `GET /students/me/dashboard` — five counters and nothing else. The unpaid
 * count is the only place a pupil can read what they still owe: the invoice
 * list beside it returns settled bills alone.
 */
export type StudentDashboard = {
  stats?: {
    invoices_total: number
    invoices_unpaid: number
    results_available: number
    materials_available: number
    fees_settled_this_session: number
  }
}

/**
 * One payment against one of the pupil's invoices — the receipt trail the
 * bursary writes as it takes the money. `discount` and the office's own note
 * are on it, and both are the pupil's own business to read.
 */
export type MyPayment = {
  id: number
  invoice_id: number | null
  fee_id: number | null
  session_id: number | null
  /** Money comes back as a string here, as everywhere else on this API. */
  amount: string
  discount: string | null
  paystatus: string
  /** The bursary's reference, e.g. `MANUAL_CASH_20260831083755_1`. */
  payref: string | null
  /** How it was taken — `cash` for money over the counter. */
  pgateway: string | null
  notes: string | null
  transdate: string | null
  fee?: Record<string, unknown>
  session?: Record<string, unknown>
}

/**
 * `GET /students/me/invoices` answers with both halves of the ledger: the
 * bills, and the payments taken against them. It returns settled bills only
 * whatever it is asked — see the dashboard's `invoices_unpaid` for the rest.
 */
export type MyInvoices = {
  invoices: Invoice[]
  transactions: MyPayment[]
}

/**
 * One approved mark, as `GET /students/me/results` sends it.
 *
 * Unverified in one respect only: no pupil on this school has an approved
 * result, so the endpoint has only ever answered `{ results: [] }`. The fields
 * are the ones `/teachers/me/results` sends off the same table, minus the
 * pupil it is already about — and every one of them is read defensively here,
 * because a shape nobody has seen filled in is a shape worth doubting.
 */
export type MyResult = {
  id: number
  subject_id?: number | null
  /** Continuous assessment; `score` is the exam and `total` is the two summed. */
  ca?: string | number | null
  score?: string | number | null
  total?: string | number | null
  grade?: string | null
  remark?: string | null
  /** Approved by definition here — the endpoint sends nothing still pending. */
  approval_status?: string | null
  uploaddate?: string | null
  session?: { id: number; name: string } | null
  semester?: { id: number; name: string } | null
  subject?: { id: number; name: string } | null
  department?: { id: number; name: string } | null
}

/**
 * One file a teacher has shared with the pupil's class, as
 * `GET /students/me/materials` would send it.
 *
 * Unverified, and less certain than the result shape beside it. Course
 * materials are their own table — deleting a subject counts `coursematerials`
 * apart from `topics`, `results` and `setassignments` — and nothing in this
 * API writes to it: there is no upload route on a teacher login, an admin
 * login or anywhere else. Every subject in the school reports a count of 0, so
 * the endpoint has only ever answered `{ "materials": [] }` and no second
 * route reads the table to compare against.
 *
 * The fields below are `topics`, the neighbour that table is counted beside
 * and the closest evidence there is of the hand that built it. Every one of
 * them is optional and read defensively, because a shape nobody has seen
 * filled in is a shape worth doubting.
 */
export type MyMaterial = {
  id: number
  subject_id?: number | null
  title?: string | null
  uploaddate?: string | null
  subject?: { id: number; name: string } | null
  department?: { id: number; name: string } | null
}

/**
 * One subject the pupil is registered for, as `GET /students/me/courses`
 * would send it.
 *
 * Unverified in the same way the materials shape is: the registration this
 * endpoint reads is empty for the whole school. Nobody is registered for
 * anything — `GET /teachers/me/registered-students?subject_id=` answers
 * `{ "registered": [] }` for every subject a teacher holds — and no route in
 * the API registers anyone, so the table cannot be filled from outside.
 *
 * The fields are the subject row itself, which two live endpoints do send:
 * `/teachers/me/subjects` expands `department` on it, and `/subjects/{id}`
 * carries `teachers` as `{ id, name }`. Both are read defensively, `teachers`
 * the more so — a pupil login can reach neither endpoint to confirm the join
 * comes through on theirs.
 */
export type MyCourse = {
  id: number
  name?: string | null
  subjectcode?: string | null
  department_id?: number | null
  department?: { id: number; name: string } | null
  teachers?: { id: number; name: string }[] | null
}

export type MyResultParams = {
  session_id?: number
  semester_id?: number
}
