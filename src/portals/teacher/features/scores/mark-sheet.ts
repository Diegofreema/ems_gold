import { gradeFor, totalOf, type Grade } from './grade'
import type { Pupil } from './roster'

export type SheetRow = Pupil & { total: number; grade: Grade }

/** Recomputes every total and grade from what is currently typed. */
export function markSheet(pupils: Pupil[]): SheetRow[] {
  return pupils.map((pupil) => {
    const total = totalOf(pupil.ca, pupil.exam)
    return { ...pupil, total, grade: gradeFor(total) }
  })
}
