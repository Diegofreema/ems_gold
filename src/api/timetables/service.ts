import { request } from '../client'
import type { Id } from '../types'
import type {
  ChildTimetable,
  ChildrenParams,
  ClassTimetable,
  Period,
  PeriodBody,
  PeriodEditBody,
  PeriodList,
  PeriodParams,
  TermParams,
} from './types'

/**
 * The class timetable. Who may read what is the server's decision, not ours —
 * `/timetables/classes` answers with exactly the classes the caller may open,
 * so a class picker is built from that and never from a role check here.
 */
export const timetablesService = {
  /**
   * The caller's own class grid. Pass both term ids for a past term; either
   * one alone is ignored. A guardian calling this is refused — `children` is
   * theirs.
   */
  mine: (params: TermParams = {}) =>
    request<ClassTimetable>('timetables/mine', { query: { ...params } }),

  /**
   * One entry per child. A child with no class yet answers a null timetable
   * beside the school's own sentence for why.
   *
   * Unverified: no guardian login is to hand, so `children` is the contract's
   * key and not one that has been seen. Check it before wiring this up.
   */
  children: (params: ChildrenParams = {}) =>
    request<{ children: ChildTimetable[] }>('timetables/children', {
      query: { ...params },
    }).then((data) => data.children ?? []),

  /**
   * Exactly the classes this account may open: its own for a pupil, one per
   * child for a guardian, all of them for staff.
   *
   * Two classes on this school share the name "SSS I" (ids 2 and 6), so a
   * picker must key on the id and never on the name.
   */
  classes: () =>
    request<{ classes: { id: number; name: string }[] }>('timetables/classes').then(
      (data) => data.classes ?? [],
    ),

  /** 403 where the class exists but is closed to the caller; 404 where it does not. */
  forClass: (id: Id, params: TermParams = {}) =>
    request<ClassTimetable>(`timetables/class/${id}`, { query: { ...params } }),

  /** Every period in the school, flat and paged. The office only. */
  periods: (params: PeriodParams = {}) =>
    request<PeriodList>('timetables', { query: { ...params } }),

  period: (id: Id) =>
    request<{ period: Period }>(`timetables/${id}`).then((data) => data.period),

  /** 422 with neither subject nor title; 409 where the slot overlaps another. */
  addPeriod: (body: PeriodBody) => request<unknown>('timetables', { method: 'POST', body }),

  /** Partial: what is left out is left alone. Overlap is checked again. */
  editPeriod: (id: Id, body: PeriodEditBody) =>
    request<unknown>(`timetables/${id}`, { method: 'PUT', body }),

  removePeriod: (id: Id) => request<unknown>(`timetables/${id}`, { method: 'DELETE' }),
}
