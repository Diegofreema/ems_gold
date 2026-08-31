import type { Student, StudentDashboard } from '../../api/my-schooling/types.ts'

/**
 * The two things the pupil's own pages say about them beside their name: what
 * class they are in, and whether the office is still waiting on a fee.
 */

/**
 * The arm is the more particular of the two, and the one a pupil would name if
 * asked; the class the office filed them under stands in where no arm is set.
 */
export function armOf(student: Student): string | undefined {
  return student.class_arm?.arm_name ?? student.department?.name
}

export type FeeStanding = { label: string; owing: boolean }

/**
 * Where the pupil stands on fees, counted by the school rather than by us.
 *
 * `GET /students/me/invoices` is not the place to count this: it hands back
 * three settled bills for a pupil the dashboard says has four, one of them
 * unpaid, and it ignores every filter offered to it. The dashboard's own
 * count is the only figure a pupil can read that includes what they owe.
 */
export function feeStanding(dashboard: StudentDashboard | undefined): FeeStanding | null {
  const unpaid = dashboard?.stats?.invoices_unpaid
  if (typeof unpaid !== 'number') return null

  if (unpaid === 0) return { label: 'Fees cleared', owing: false }
  return { label: `${unpaid} invoice${unpaid === 1 ? '' : 's'} unpaid`, owing: true }
}
