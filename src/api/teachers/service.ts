import { paginated, request, requestBlob } from '../client'
import type { Id } from '../types'
import type {
  AssignSubjectsBody,
  CreateStaffBody,
  MailStaffBody,
  StaffListParams,
  Teacher,
  UpdateStaffBody,
} from './types'

export const teachersService = {
  list: (params: StaffListParams = {}) =>
    request<Record<string, unknown>>('teachers', { query: { ...params } }).then((data) =>
      paginated<Teacher>(data, 'teachers'),
    ),

  get: (id: Id) => request<{ teacher: Teacher }>(`teachers/${id}`).then((data) => data.teacher),

  /** Creates the Users login and the Teachers record in one call. */
  create: (body: CreateStaffBody) =>
    request<{ teacher: Teacher }>('teachers', { method: 'POST', body }),

  update: (id: Id, body: UpdateStaffBody) =>
    request<{ teacher: Teacher }>(`teachers/${id}`, { method: 'POST', body }),

  /** Permanent — there is no undo. */
  remove: (id: Id) => request<unknown>(`teachers/${id}`, { method: 'DELETE' }),

  assignSubjects: (id: Id, body: AssignSubjectsBody) =>
    request<unknown>(`teachers/${id}/subjects`, { method: 'POST', body }),

  /** 404 when nothing has been uploaded. */
  cv: (id: Id) => requestBlob(`teachers/${id}/cv`),

  mail: (body: MailStaffBody) => request<unknown>('teachers/mail', { method: 'POST', body }),
}
