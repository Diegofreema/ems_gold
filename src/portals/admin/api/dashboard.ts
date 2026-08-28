import { queryOptions } from '@tanstack/react-query'
import type { ActivityEntry } from '@/components/common/activity-list'
import type { Bar } from '@/components/charts/bar-chart'

export type DashboardFigure = {
  label: string
  amount: number
  format: 'naira' | 'number' | 'percent'
  delta: string
  /** Renders the delta in accent — the figure needs attention. */
  hot?: boolean
}

export type AdminDashboard = {
  money: DashboardFigure[]
  people: DashboardFigure[]
  collections: { bars: Bar[]; peak: number }
  activity: ActivityEntry[]
}

/** Stand-in for `GET /admin/dashboard`. Replace the body with a fetch. */
async function fetchDashboard(): Promise<AdminDashboard> {
  return {
    money: [
      { label: 'Collected this term', amount: 48_250_000, format: 'naira', delta: '79% of expected' },
      { label: 'Outstanding', amount: 12_480_000, format: 'naira', delta: '214 invoices overdue', hot: true },
      { label: 'Collected today', amount: 1_930_000, format: 'naira', delta: '31 payments' },
      { label: 'Spent this month', amount: 4_182_000, format: 'naira', delta: 'Salaries lead' },
    ],
    people: [
      { label: 'Pupils enrolled', amount: 1842, format: 'number', delta: 'Primary 968 · Secondary 874' },
      { label: 'Present today', amount: 94, format: 'percent', delta: '82 absent, 3 arms unmarked', hot: true },
      { label: 'Staff', amount: 128, format: 'number', delta: '96 teaching' },
      { label: 'New applicants', amount: 37, format: 'number', delta: '14 awaiting review', hot: true },
    ],
    collections: {
      peak: 15,
      bars: [
        { label: 'Sep', value: 9.4, display: '₦9.4m' },
        { label: 'Oct', value: 14.2, display: '₦14.2m', highlight: true },
        { label: 'Nov', value: 11.6, display: '₦11.6m' },
        { label: 'Dec', value: 6.1, display: '₦6.1m' },
        { label: 'Jan', value: 4.2, display: '₦4.2m' },
        { label: 'Feb', value: 2.7, display: '₦2.7m' },
      ],
    },
    activity: [
      { id: 'a1', text: 'Fee schedule for Primary 4 published', who: 'A. Okonkwo', when: '09:12' },
      { id: 'a2', text: '18 invoices moved to overdue', who: 'System', when: '08:05', flagged: true },
      { id: 'a3', text: 'BAT-1121 rejected — two CA scores missing', who: 'Bursary', when: 'Yesterday', flagged: true },
      { id: 'a4', text: 'Ngozi Eze admitted into SS1 A', who: 'A. Okonkwo', when: 'Yesterday' },
      { id: 'a5', text: 'Remita payment of ₦45,000 unmatched', who: 'System', when: '18 Nov', flagged: true },
      { id: 'a6', text: 'Term dates confirmed for Second Term', who: 'Principal', when: '15 Nov' },
    ],
  }
}

export const adminDashboardQuery = queryOptions({
  queryKey: ['admin', 'dashboard'],
  queryFn: fetchDashboard,
})
