import type {
  AtRiskPupil,
  AttendanceVsMarksRow,
  ClassSubjectPerformance,
  GradeBucket,
  Mover,
  PerformanceSubject,
  PerformanceTerm,
} from '../../api/performance/types.ts'
import { looseNumber, looseText, pick } from '../collections/loose.ts'

/**
 * Reading the performance rows, none of which anybody has seen filled in.
 *
 * Every envelope `/performance` sends is verified — the tiles, the thresholds,
 * the correlation, the sentences — because the live answers carried all of
 * them. Every *row* inside one was an empty array, since the school this was
 * read against holds five marks and none of them approved. So the fields on a
 * row are read for the first candidate that actually carries something, in
 * one place and under test, rather than pinned to one spelling that would
 * draw a blank table for ever if it turned out to be another.
 *
 * The whole module is meant to shrink to one spelling each the first time
 * somebody approves a mark and reads a real answer. Until then a row that
 * matches none of the candidates comes back named but blank, which a table
 * shows as a dash — never as a zero, which would read as a child who scored
 * nothing.
 */

/** A row's own name, and a key that is stable within its list. */
export type Named = { key: string; name: string }

/** One term of a student's history: what it was called, and what they averaged. */
export type TermLine = Named & { average: number | undefined }

/** One subject against the student's own average. */
export type SubjectLine = Named & {
  average: number | undefined
  /** Points above or below the student's own average. Undefined without both. */
  gap: number | undefined
}

/** One subject across a class. `spread` is what separates two equal averages. */
export type ClassSubjectLine = Named & {
  average: number | undefined
  highest: number | undefined
  lowest: number | undefined
  spread: number | undefined
  passRate: number | undefined
  counted: number | undefined
}

/** How many students fall in one grade band. */
export type GradeLine = Named & { count: number }

/** A student whose average moved between two terms. */
export type MoverLine = Named & {
  from: number | undefined
  to: number | undefined
  /** Positive for a riser. Worked out from the two ends where it is not sent. */
  change: number | undefined
}

/** A student's attendance beside their average — one point of the scatter. */
export type StudentPointLine = Named & {
  attendance: number | undefined
  average: number | undefined
}

/** A student the thresholds picked out, and the school's own reasons why. */
export type RiskLine = Named & {
  reasons: string[]
  average: number | undefined
  attendance: number | undefined
}

const NAME_KEYS = ['name', 'student_name', 'fullname', 'full_name', 'student', 'pupil']
const SUBJECT_KEYS = ['subject_name', 'subject', 'name', 'title', 'label']
const TERM_KEYS = ['semester', 'term', 'label', 'name', 'session', 'title']
const AVERAGE_KEYS = ['average', 'avg', 'mean', 'score', 'percentage', 'total']

export function termLines(rows: readonly PerformanceTerm[]): TermLine[] {
  return rows.map((row, index) => ({
    ...named(row, index, TERM_KEYS, 'Term'),
    average: number(row, AVERAGE_KEYS),
  }))
}

/**
 * The subjects, each with the gap to the student's own average.
 *
 * The gap is the point of this endpoint: a child on 55 who scores 80
 * everywhere else is struggling, and a child on 55 in a class averaging 40 is
 * not. It is worked out here where the server did not send it, and read
 * where it did.
 */
export function subjectLines(
  rows: readonly PerformanceSubject[],
  ownAverage: number | null,
): SubjectLine[] {
  return rows.map((row, index) => {
    const average = number(row, AVERAGE_KEYS)
    const sent = number(row, ['gap', 'difference', 'delta', 'vs_own_average'])
    return {
      ...named(row, index, SUBJECT_KEYS, 'Subject'),
      average,
      gap:
        sent ??
        (average !== undefined && ownAverage !== null
          ? round(average - ownAverage)
          : undefined),
    }
  })
}

export function classSubjectLines(
  rows: readonly ClassSubjectPerformance[],
): ClassSubjectLine[] {
  return rows.map((row, index) => ({
    ...named(row, index, SUBJECT_KEYS, 'Subject'),
    average: number(row, AVERAGE_KEYS),
    highest: number(row, ['highest', 'max', 'maximum', 'best', 'top']),
    lowest: number(row, ['lowest', 'min', 'minimum', 'worst', 'bottom']),
    spread: number(row, ['spread', 'stdev', 'std_dev', 'standard_deviation', 'range']),
    passRate: number(row, ['pass_rate', 'passrate', 'pass_percentage', 'passed']),
    counted: number(row, ['marks_counted', 'counted', 'marks', 'pupils', 'students']),
  }))
}

export function gradeLines(rows: readonly GradeBucket[]): GradeLine[] {
  return rows.map((row, index) => ({
    ...named(row, index, ['grade', 'label', 'name', 'band'], 'Grade'),
    count: number(row, ['count', 'total', 'pupils', 'students']) ?? 0,
  }))
}

/**
 * The movers, with the change worked out from the two ends where the server
 * did not send it — so a list can be ordered by how far somebody moved
 * whichever way this answer happens to be spelled.
 */
export function moverLines(rows: readonly Mover[]): MoverLine[] {
  return rows.map((row, index) => {
    const from = number(row, ['from', 'from_average', 'before', 'previous', 'was'])
    const to = number(row, ['to', 'to_average', 'after', 'current', 'now'])
    const sent = number(row, ['change', 'delta', 'difference', 'movement'])
    return {
      ...named(row, index, NAME_KEYS, 'Student'),
      from,
      to,
      change:
        sent ?? (from !== undefined && to !== undefined ? round(to - from) : undefined),
    }
  })
}

export function studentPointLines(
  rows: readonly AttendanceVsMarksRow[],
): StudentPointLine[] {
  return rows.map((row, index) => ({
    ...named(row, index, NAME_KEYS, 'Student'),
    attendance: number(row, ['attendance', 'attendance_rate', 'rate', 'present_rate']),
    average: number(row, AVERAGE_KEYS),
  }))
}

/**
 * The flagged students and the figures that flagged them.
 *
 * `reasons` is the one field name with any evidence behind it — the API
 * collection's own test asserts every row carries a non-empty array of them —
 * and it is what makes this list safe to show at all: a student listed without
 * the reason is an accusation, and a student listed with it is a prompt a
 * teacher can disagree with.
 */
export function riskLines(rows: readonly AtRiskPupil[]): RiskLine[] {
  return rows.map((row, index) => ({
    ...named(row, index, NAME_KEYS, 'Student'),
    reasons: reasonsOf(row),
    average: number(row, AVERAGE_KEYS),
    attendance: number(row, ['attendance', 'attendance_rate', 'rate']),
  }))
}

/** Which way a student is going, as a tone rather than a colour decision. */
export function directionTone(direction: string | null): 'up' | 'down' | 'muted' {
  const word = (direction ?? '').toLowerCase()
  if (/(up|ris|improv|better|gain)/.test(word)) return 'up'
  if (/(down|fall|declin|worse|drop)/.test(word)) return 'down'
  return 'muted'
}

/** A figure as a table cell shows it: one decimal, or a dash for nothing. */
export function figure(value: number | undefined | null, suffix = ''): string {
  if (value === undefined || value === null || !Number.isFinite(value)) return '—'
  const rounded = round(value)
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}${suffix}`
}

/** A gap or a change, always signed, so "+4" reads as movement rather than a mark. */
export function signed(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return '—'
  const rounded = round(value)
  const shown = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
  return rounded > 0 ? `+${shown}` : shown
}

function named(
  row: Record<string, unknown>,
  index: number,
  keys: string[],
  fallback: string,
): Named {
  const read = looseText(pick(row, ...keys))
  return {
    key: String(pick(row, 'id', 'student_id', 'subject_id', 'semester_id') ?? `row-${index}`),
    name: read === '—' ? `${fallback} ${index + 1}` : read,
  }
}

function number(row: Record<string, unknown>, keys: string[]): number | undefined {
  const value = pick(row, ...keys)
  return value === undefined ? undefined : looseNumber(value)
}

function reasonsOf(row: Record<string, unknown>): string[] {
  const value = pick(row, 'reasons', 'why', 'flags')
  if (Array.isArray(value)) {
    return value.map((one) => looseText(one)).filter((one) => one !== '—')
  }
  return typeof value === 'string' && value.trim() ? [value.trim()] : []
}

const round = (value: number) => Math.round(value * 10) / 10
