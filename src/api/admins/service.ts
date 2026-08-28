import { paginated, request } from '../client'
import type { Id } from '../types'
import type { Admin } from '../users/types'
import type {
  AdminActivity,
  AdminListParams,
  AdminPrivileges,
  CreateAdminBody,
  SetPrivilegesBody,
  UpdateAdminRecordBody,
} from './types'

export const adminsService = {
  list: (params: AdminListParams = {}) =>
    request<Record<string, unknown>>('admins', { query: { ...params } }).then((data) =>
      paginated<Admin>(data, 'admins'),
    ),

  /** The caller's own office record. */
  profile: () => request<{ admin: Admin }>('admins/profile').then((data) => data.admin),

  get: (id: Id) => request<{ admin: Admin }>(`admins/${id}`).then((data) => data.admin),

  /** Creates the Users login and the Admins profile in one call. */
  create: (body: CreateAdminBody) =>
    request<{ admin: Admin }>('admins/new-admin', { method: 'POST', body }),

  update: (id: Id, body: UpdateAdminRecordBody) =>
    request<{ admin: Admin }>(`admins/${id}`, { method: 'POST', body }),

  /** Permanent. Never your own, and admin 1 is protected. */
  remove: (id: Id) => request<unknown>(`admins/${id}`, { method: 'DELETE' }),

  /** What they hold, plus the full list to choose from. */
  privileges: (id: Id) => request<AdminPrivileges>(`admins/${id}/privileges`),

  setPrivileges: (id: Id, body: SetPrivilegesBody) =>
    request<AdminPrivileges>(`admins/${id}/privileges`, { method: 'POST', body }),

  activityLogs: (id: Id, limit?: number) =>
    request<AdminActivity>(`admins/${id}/activity-logs`, { query: { limit } }),
}
