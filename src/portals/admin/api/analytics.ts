import type { Bar } from '@/components/charts/bar-chart'
import type { Rate } from '@/components/charts/rate-bars'
import type { Tile } from '@/components/page/tile-strip'

export const biTiles: Tile[] = [
  { label: 'Billed this session', value: '₦61,200,000', delta: 'Across 1,842 pupils' },
  { label: 'Collected', value: '₦48,250,000', delta: '79% collection rate' },
  { label: 'Outstanding', value: '₦12,480,000', delta: '214 invoices overdue', deltaTone: 'brand' },
  { label: 'Cost per pupil', value: '₦33,200', delta: 'Spendings ÷ enrolment' },
]

export const feeRates: Rate[] = [
  { label: 'Tuition — Primary', percent: 92, amount: '₦24.9m' },
  { label: 'Tuition — JSS', percent: 84, amount: '₦16.2m' },
  { label: 'Tuition — SS', percent: 76, amount: '₦12.1m' },
  { label: 'Boarding', percent: 61, amount: '₦7.6m' },
  { label: 'Examination (WAEC)', percent: 48, amount: '₦0.9m' },
]

/** A pass rate under 50 renders in accent. */
export const subjectBars: Bar[] = [
  { label: 'MTH', value: 71, display: '71%' },
  { label: 'ENG', value: 78, display: '78%' },
  { label: 'BSC', value: 66, display: '66%' },
  { label: 'BIO', value: 58, display: '58%' },
  { label: 'CHM', value: 44, display: '44%', highlight: true },
  { label: 'CMP', value: 88, display: '88%' },
]

export const debtors = [
  { id: 'd-1', parent: 'Alhaji M. Bello', children: '3', owing: '₦142,500', days: '38' },
  { id: 'd-2', parent: 'Dr. P. Eze', children: '1', owing: '₦120,000', days: '14' },
  { id: 'd-3', parent: 'Mr. Emmanuel Udo', children: '2', owing: '₦117,000', days: '38' },
  { id: 'd-4', parent: 'Mrs. F. Adeyemi', children: '2', owing: '₦98,000', days: '21' },
  { id: 'd-5', parent: 'Mr. K. Balogun', children: '1', owing: '₦85,000', days: '9' },
]
