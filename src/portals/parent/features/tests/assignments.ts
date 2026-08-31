import type { ChildAssignment, ChildAssignmentPaper } from '../../../../api/parents/types.ts'
import { BLANK } from '../../../../features/collections/blank.ts'
import type { Row } from '../../../../features/collections/types.ts'
import { schoolTime, when } from '../../../../features/collections/when.ts'
import { text } from '../../family.ts'

/** The API's word for a paper the child has not sat yet. */
const OPEN = 'available'

/** A stamp read on the school's own clock, or null where it will not parse. */
function at(stamp: string | null): number | null {
  if (!stamp) return null
  const parsed = new Date(schoolTime(stamp) ?? '').getTime()
  return Number.isNaN(parsed) ? null : parsed
}

/**
 * Where the child stands on a paper, as one word.
 *
 * The API's own status is used wherever it says something — 'completed' is
 * theirs and reads as theirs — with one thing worked out here: a paper still
 * marked available whose closing time has passed. The endpoint does not
 * re-check the clock when it answers, and telling a family a test is open when
 * it shut yesterday is worse than saying nothing.
 */
export function assignmentState(paper: ChildAssignmentPaper, now: Date): string {
  const status = paper.status?.trim().toLowerCase()
  if (!status) return BLANK
  if (status !== OPEN) return status[0].toUpperCase() + status.slice(1)

  const closes = at(paper.closedate)
  return closes !== null && closes < now.getTime() ? 'Closed' : 'Available'
}

/** One paper, as the register draws it. Named by the paper, not the sitting. */
export function assignmentRow(paper: ChildAssignmentPaper, now: Date): Row {
  return {
    id: String(paper.setassignment_id),
    title: text(paper.title),
    subject: text(paper.subject),
    closes: when(schoolTime(paper.closedate), true),
    state: assignmentState(paper, now),

    // Read by the record panel rather than the table.
    opens: when(schoolTime(paper.opendate), true),
    limit: paper.time_limit ? `${paper.time_limit} minutes` : 'No limit',
  }
}

/**
 * The papers set for one child.
 *
 * The endpoint answers for the household — every child with their own list —
 * so the register picks its child out rather than asking again per pupil. A
 * child with nothing set is not an error: their class has no paper open.
 */
export function childPapers(
  children: ChildAssignment[],
  childId: number,
  now: Date,
): Row[] {
  const mine = children.find((entry) => entry.student?.id === childId)
  return (mine?.assignments ?? []).map((paper) => assignmentRow(paper, now))
}
