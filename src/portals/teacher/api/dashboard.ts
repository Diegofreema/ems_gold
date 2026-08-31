import { queryOptions } from '@tanstack/react-query'
import { teachingService } from '@/api/teaching/service'
import { teachingKeys } from '@/api/teaching/keys'
import type { ActivityEntry } from '@/components/common/activity-list'
import type { DashboardFigure } from '@/components/common/figure-tiles'
import {
  armRows,
  assignmentEntries,
  teacherFigures,
  teacherNote,
} from '../features/dashboard/dashboard'

export type TeacherHome = {
  figures: DashboardFigure[]
  /** The line under the greeting, which says whether anything is waiting. */
  note: string
  /** The papers this teacher has set, newest first. */
  papers: ActivityEntry[]
  /** The arms taken, each against its class. */
  arms: { label: string; value: string }[]
}

/** `GET /teachers/me/dashboard` — the counters, the papers and the arms. */
async function fetchDashboard(): Promise<TeacherHome> {
  const dashboard = await teachingService.dashboard()
  const now = new Date()

  return {
    figures: teacherFigures(dashboard),
    note: teacherNote(dashboard.stats),
    papers: assignmentEntries(dashboard.recent_assignments, now),
    arms: armRows(dashboard.class_arms),
  }
}

export const teacherDashboardQuery = queryOptions({
  queryKey: teachingKeys.dashboard(),
  queryFn: fetchDashboard,
})
