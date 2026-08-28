export const GRADES = ['A', 'B', 'C', 'D', 'E', 'F'] as const
export type Grade = (typeof GRADES)[number]

/** The design's mark caps: continuous assessment out of 30, exam out of 70. */
export const CA_MAX = 30
export const EXAM_MAX = 70

/** Lowest total that still earns each grade, best first. */
const BANDS: [Grade, number][] = [
  ['A', 75],
  ['B', 65],
  ['C', 55],
  ['D', 45],
  ['E', 40],
]

export function gradeFor(total: number): Grade {
  return BANDS.find(([, floor]) => total >= floor)?.[0] ?? 'F'
}

/** Blank and non-numeric entries count as zero, exactly as the sheet shows. */
export function markOf(value: string): number {
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? 0 : parsed
}

export function totalOf(ca: string, exam: string): number {
  return markOf(ca) + markOf(exam)
}

export function sheetAverage(totals: number[]): number {
  if (totals.length === 0) return 0
  const sum = totals.reduce((running, total) => running + total, 0)
  return Math.round(sum / totals.length)
}
