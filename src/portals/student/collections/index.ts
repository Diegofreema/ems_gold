import type { CollectionDef } from '@/features/collections/types'
import { results, tests } from './assessment'
import { attendance } from './attendance'
import { invoices } from './finance'
import { courses, materials, timetable } from './learning'

/** Every student list page, keyed by its route id. */
export const studentCollections = {
  courses,
  materials,
  timetable,
  tests,
  results,
  attendance,
  invoices,
} satisfies Record<string, CollectionDef>
