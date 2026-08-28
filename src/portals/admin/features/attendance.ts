export type AttendanceRecord = {
  /** Days the school was open in the range. */
  open: number
  present: number
}

export function rateFor(record: AttendanceRecord): number {
  return record.open === 0 ? 0 : Math.round((record.present / record.open) * 100)
}

export type Standing = 'Good' | 'Watch' | 'Poor'

/** The design's three bands, used for the termly report to parents. */
export function standingFor(rate: number): Standing {
  if (rate >= 95) return 'Good'
  return rate >= 85 ? 'Watch' : 'Poor'
}
