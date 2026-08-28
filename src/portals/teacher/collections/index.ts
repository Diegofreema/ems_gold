import type { CollectionDef } from '@/features/collections/types'
import { results, uploads } from './assessment'
import { eclasses, students, subjects, topics } from './teaching'

/** Every teacher list page, keyed by its route id. */
export const teacherCollections = {
  subjects,
  students,
  topics,
  eclasses,
  uploads,
  results,
} satisfies Record<string, CollectionDef>
