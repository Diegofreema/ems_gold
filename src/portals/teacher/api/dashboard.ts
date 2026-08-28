import { queryOptions } from '@tanstack/react-query'
import type { Bar } from '@/components/charts/bar-chart'
import type { DashboardFigure } from '@/components/common/figure-tiles'
import type { Period } from '../features/timetable-list'

export type TeacherDashboard = {
  figures: DashboardFigure[]
  timetable: Period[]
  /** Mid-term class averages, out of 100. */
  armAverages: Bar[]
}

/** An arm below this is shown in accent — it needs attention. */
const WEAK_AVERAGE = 50

function armBar(label: string, score: number): Bar {
  return {
    label,
    value: score,
    display: String(score),
    highlight: score < WEAK_AVERAGE,
  }
}

/** Stand-in for `GET /teachers/me/dashboard`. Replace the body with a fetch. */
async function fetchDashboard(): Promise<TeacherDashboard> {
  return {
    figures: [
      { label: 'Pupils taught', amount: 143, format: 'number', delta: 'Across 4 arms' },
      { label: 'Sheets outstanding', amount: 2, format: 'number', delta: 'Due 05 December', hot: true },
      { label: 'Scores entered', amount: 178, format: 'number', delta: 'This term' },
      { label: 'Class average', amount: 64, format: 'percent', delta: 'Up 3 points on last term' },
    ],
    timetable: [
      { id: 'p1', time: '08:00 – 08:40', subject: 'Mathematics', arm: 'SS1 A', room: 'Block B, Rm 4', state: 'Taught' },
      { id: 'p2', time: '08:40 – 09:20', subject: 'Mathematics', arm: 'SS1 A', room: 'Block B, Rm 4', state: 'Taught' },
      { id: 'p3', time: '10:00 – 10:40', subject: 'Further Maths', arm: 'SS2 A', room: 'Block B, Rm 7', state: 'Next' },
      { id: 'p4', time: '11:20 – 12:00', subject: 'Basic Science', arm: 'JSS2 A', room: 'Lab 1', state: 'Later' },
      { id: 'p5', time: '13:00 – 13:40', subject: 'Mathematics', arm: 'SS3 A', room: 'Block C, Rm 2', state: 'Later' },
    ],
    armAverages: [
      armBar('SS1 A', 71),
      armBar('SS2 A', 62),
      armBar('SS3 A', 48),
      armBar('JSS2 A', 66),
    ],
  }
}

export const teacherDashboardQuery = queryOptions({
  queryKey: ['teacher', 'dashboard'],
  queryFn: fetchDashboard,
})
