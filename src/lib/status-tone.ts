import type { TagProps } from '@/components/common/tag'

// 'Not current' is settled, not good news: four sessions out of five are not
// the current one, and painting every last one of them green would read as
// four endorsements. It stays quiet.
const GOOD = ['Active', 'Paid', 'Cleared', 'Approved', 'Marked', 'Current', 'Present', 'Excused', 'Enabled', 'Available', 'Completed', 'Admitted', 'In this arm', 'Submitted', 'Correct', 'Returned']
const QUIET = ['Not current']
const BAD = ['Overdue', 'Unpaid', 'Suspended', 'Not marked', 'All out', 'Rejected', 'Sent back', 'Declined', 'Owing', 'Not placed', 'Absent', 'Disabled', 'Deactivated', 'Missed', 'Wrong']

/**
 * The design colours a status by what it means, not by which table it is in:
 * good news reads green, states needing action read red, settled states are
 * quiet, and anything in between is outlined.
 */
export function toneForStatus(status: string): NonNullable<TagProps['variant']> {
  if (GOOD.includes(status)) return 'good'
  if (QUIET.includes(status)) return 'neutral'
  if (BAD.includes(status)) return 'bad'
  return 'outline'
}
