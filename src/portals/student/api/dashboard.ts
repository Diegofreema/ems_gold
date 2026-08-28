import { queryOptions } from '@tanstack/react-query'
import type { Bar } from '@/components/charts/bar-chart'
import type { DashboardFigure } from '@/components/common/figure-tiles'
import type { WeekItem } from '../features/week-list'

export type StudentDashboard = {
  figures: DashboardFigure[]
  week: WeekItem[]
  scores: Bar[]
}

/** A subject below this is shown in accent — it needs attention. */
const WEAK_SCORE = 65

function scoreBar(label: string, score: number): Bar {
  return {
    label,
    value: score,
    display: String(score),
    highlight: score < WEAK_SCORE,
  }
}

/** Stand-in for `GET /students/me/dashboard`. Replace the body with a fetch. */
async function fetchDashboard(): Promise<StudentDashboard> {
  return {
    figures: [
      { label: 'Term average', amount: 74.2, format: 'decimal', delta: 'Position 4 of 35' },
      { label: 'Tests open', amount: 1, format: 'number', delta: 'Closes Friday', hot: true },
      { label: 'Subjects', amount: 10, format: 'number', delta: '7 results approved' },
      { label: 'Outstanding fees', amount: 0, format: 'number', delta: 'Cleared for this term' },
    ],
    week: [
      { id: 'w1', day: 'Today', title: 'Quadratic equations quiz', subject: 'Mathematics', state: 'Open' },
      { id: 'w2', day: 'Wed', title: 'Biology practical write-up due', subject: 'Biology', state: 'Due' },
      { id: 'w3', day: 'Thu', title: 'E-class: quadratics clinic, 16:00', subject: 'Mathematics', state: 'Booked' },
      { id: 'w4', day: 'Fri', title: 'Quadratics quiz closes 15:00', subject: 'Mathematics', state: 'Deadline' },
      { id: 'w5', day: 'Mon', title: 'Comprehension set 3 submission', subject: 'English Language', state: 'Due' },
    ],
    scores: [
      scoreBar('MTH', 78),
      scoreBar('ENG', 72),
      scoreBar('BIO', 71),
      scoreBar('CMP', 85),
      scoreBar('CHM', 60),
    ],
  }
}

export const studentDashboardQuery = queryOptions({
  queryKey: ['student', 'dashboard'],
  queryFn: fetchDashboard,
})
