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

  /**
   * Broken on bronze: it answers "Admin not found." for any administrator
   * whose login has no country or state on it — seven of the nine on record —
   * apparently an inner join on tables that have no row 0. The list expands
   * everything this would, so the register reads a record from there instead.
   * Kept because it is the documented route and will work once that is fixed.
   */
  get: (id: Id) => request<{ admin: Admin }>(`admins/${id}`).then((data) => data.admin),

  /** Creates the Users login and the Admins profile in one call. */
  create: (body: CreateAdminBody) =>
    request<{ admin: Admin }>('admins/new-admin', { method: 'POST', body }),

  update: (id: Id, body: UpdateAdminRecordBody) =>
    request<{ admin: Admin }>(`admins/${id}`, { method: 'POST', body }),

  /** Permanent. Never your own, and admin 1 is protected. */
  remove: (id: Id) => request<unknown>(`admins/${id}`, { method: 'DELETE' }),

  /**
   * What they hold, plus the full list to choose from. Unlike `get` this
   * answers for every administrator, so it doubles as the way to read one.
   */
  privileges: (id: Id) => request<AdminPrivileges>(`admins/${id}/privileges`),

  setPrivileges: (id: Id, body: SetPrivilegesBody) =>
    request<AdminPrivileges>(`admins/${id}/privileges`, { method: 'POST', body }),

  activityLogs: (id: Id, limit?: number) =>
    request<AdminActivity>(`admins/${id}/activity-logs`, { query: { limit } }),
}
