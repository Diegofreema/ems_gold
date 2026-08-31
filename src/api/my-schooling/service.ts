import { request } from '../client'
import type {
  MyCourse,
  MyInvoices,
  MyMaterial,
  MyResult,
  MyResultParams,
  Student,
  StudentDashboard,
  UpdateMyRecordBody,
} from './types'

/** Everything under `/students/me` — the pupil is resolved from the token. */
export const mySchoolingService = {
  record: () => request<{ student: Student }>('students/me').then((data) => data.student),

  updateRecord: (body: UpdateMyRecordBody) =>
    request<{ student: Student }>('students/me', { method: 'POST', body }),

  dashboard: () => request<StudentDashboard>('students/me/dashboard'),

  /** Subjects the caller is registered for. Empty school-wide — see `MyCourse`. */
  courses: () =>
    request<{ courses: MyCourse[] }>('students/me/courses').then((data) => data.courses ?? []),

  /** The bills and the payments taken against them, in one answer. */
  invoices: () => request<MyInvoices>('students/me/invoices'),

  /** Approved results only — a pending upload is never shown. */
  results: (params: MyResultParams = {}) =>
    request<{ results: MyResult[] }>('students/me/results', { query: { ...params } }).then(
      (data) => data.results ?? [],
    ),

  /** Files shared with the caller's class. Empty school-wide — see `MyMaterial`. */
  materials: () =>
    request<{ materials: MyMaterial[] }>('students/me/materials').then(
      (data) => data.materials ?? [],
    ),
}
