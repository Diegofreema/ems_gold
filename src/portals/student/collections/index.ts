import type { CollectionDef } from '@/features/collections/types'
import { results, tests } from './assessment'
import { invoices, record } from './finance'
import { courses, materials, timetable } from './learning'

/** Every student list page, keyed by its route id. */
export const studentCollections = {
  courses,
  materials,
  timetable,
  tests,
  results,
  invoices,
  record,
} satisfies Record<string, CollectionDef>
