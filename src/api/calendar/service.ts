import { paginated, request } from '../client'
import type { Id } from '../types'
import type { CalendarBody, CalendarListParams, CalendarRecord } from './types'

/**
 * Sessions and terms are the same six endpoints under two paths, so they are
 * built once. `resource` is the path, `key` the property the API nests a
 * single record under.
 */
function calendarResource(resource: 'sessions' | 'semesters', key: 'session' | 'semester') {
  return {
    list: (params: CalendarListParams = {}) =>
      request<Record<string, unknown>>(resource, { query: { ...params } }).then((data) => ({
        ...paginated<CalendarRecord>(data, resource),
        currentId: data[`current_${key}_id`] as number | undefined,
      })),

    /** Read-only here — the current one is chosen in Settings. */
    current: () =>
      request<Record<string, CalendarRecord>>(`${resource}/current`).then((data) => data[key]),

    /** With a count of everything filed under it. */
    get: (id: Id) =>
      request<Record<string, CalendarRecord>>(`${resource}/${id}`).then((data) => data[key]),

    create: (body: CalendarBody) =>
      request<Record<string, CalendarRecord>>(resource, { method: 'POST', body }),

    rename: (id: Id, body: CalendarBody) =>
      request<Record<string, CalendarRecord>>(`${resource}/${id}`, { method: 'POST', body }),

    /**
     * Refused with 409 while anything is filed under it; `force` overrides
     * that. It never overrides the other rule — the current session or term
     * is not deletable, forced or not.
     */
    remove: (id: Id, force = false) =>
      request<unknown>(`${resource}/${id}`, {
        method: 'DELETE',
        query: { force: force ? 1 : undefined },
      }),
  }
}

export const sessionsService = calendarResource('sessions', 'session')

/** The table is called `semesters`, but to a school these are terms. */
export const termsService = calendarResource('semesters', 'semester')
