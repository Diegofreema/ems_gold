import { collect, fees, invoices, spendings } from './finance'
import { classes, calendar, results, subjects } from './academics'
import { parents, parentsCleared, parentsInvited, parentsOwing } from './parents'
import { elections, library, logs } from './school'
import { staff, staffAdmin, staffOther, staffTeachers } from './staff'
import { applicants, attendance, students } from './students'
import type { CollectionDef } from './types'

/** Every admin list page, keyed by its route id. */
export const adminCollections = {
  fees,
  collect,
  invoices,
  spendings,
  students,
  applicants,
  attendance,
  staff,
  'staff-admin': staffAdmin,
  'staff-teachers': staffTeachers,
  'staff-other': staffOther,
  parents,
  'parents-owing': parentsOwing,
  'parents-cleared': parentsCleared,
  'parents-invited': parentsInvited,
  classes,
  subjects,
  calendar,
  results,
  library,
  elections,
  logs,
} satisfies Record<string, CollectionDef>

export type AdminCollectionId = keyof typeof adminCollections
