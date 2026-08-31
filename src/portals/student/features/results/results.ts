import type { MyResult } from '../../../../api/my-schooling/types.ts'
import { BLANK } from '../../../../features/collections/blank.ts'
import { mark } from '../../../../features/collections/mark.ts'
import { newestFirst } from '../../../../features/collections/newest.ts'
import type { Row } from '../../../../features/collections/types.ts'
import { when } from '../../../../features/collections/when.ts'
import { text } from '../../../../features/profile/record.ts'

/**
 * The pupil's own results, off `GET /students/me/results`.
 *
 * Approved marks only — the endpoint never sends one still waiting on the
 * office — so there is no approval column here: every row on this page has
 * already been through it. The term is a column instead, because the endpoint
 * answers with every session at once unless it is asked for one, and a mark
 * without its term is a number nobody can place.
 */

/** Which term a mark belongs to, e.g. "First Term · 2024/2025". */
export function termOf(result: MyResult): string {
  return (
    [result.semester?.name, result.session?.name]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(' · ') || BLANK
  )
}

export function resultRows(results: MyResult[]): Row[] {
  return newestFirst(results).map((result) => ({
    id: String(result.id),
    // A mark whose subject was not expanded still has to be nameable: the row
    // is what a pupil would read out to a teacher who disputes it.
    subject: result.subject?.name?.trim() || `Subject ${result.subject_id ?? result.id}`,
    term: termOf(result),
    ca: mark(result.ca),
    // `score` is the exam mark; `total` is it plus the CA, summed by the
    // school rather than here — a total that disagrees with its parts is the
    // school's own arithmetic, and correcting it here would hide that.
    exam: mark(result.score),
    total: mark(result.total),
    grade: text(result.grade),

    // Read by the record panel rather than the table.
    klass: text(result.department?.name),
    session: text(result.session?.name),
    // The panel has a row for the session already, so its term is the term
    // alone; the table's `term` carries both, having no room for two columns.
    semester: text(result.semester?.name),
    remark: text(result.remark),
    filed: when(result.uploaddate, true),
  }))
}
