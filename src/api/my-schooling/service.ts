import { request } from '../client'
import type { Invoice } from '../invoices/types'
import type {
  Course,
  CourseMaterial,
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

  courses: () =>
    request<{ courses: Course[] }>('students/me/courses').then((data) => data.courses),

  invoices: () =>
    request<{ invoices: Invoice[] }>('students/me/invoices').then((data) => data.invoices),

  /** Approved results only — a pending upload is never shown. */
  results: (params: MyResultParams = {}) =>
    request<Record<string, unknown>>('students/me/results', { query: { ...params } }),

  materials: () =>
    request<{ materials: CourseMaterial[] }>('students/me/materials').then(
      (data) => data.materials,
    ),
}
