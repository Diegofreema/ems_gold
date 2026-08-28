import type { TagProps } from '@/components/common/tag'

const GOOD = ['Active', 'Paid', 'Cleared', 'Approved', 'Marked', 'Current', 'Available', 'Admitted']
const BAD = ['Overdue', 'Unpaid', 'Suspended', 'Not marked', 'All out', 'Rejected', 'Declined', 'Owing']

/**
 * The design colours a status by what it means, not by which table it is in:
 * settled states read as neutral, states needing action read as accent, and
 * anything in between is outlined.
 */
export function toneForStatus(status: string): NonNullable<TagProps['variant']> {
  if (GOOD.includes(status)) return 'neutral'
  if (BAD.includes(status)) return 'accent'
  return 'outline'
}
