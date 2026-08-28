import type { Bar } from '@/components/charts/bar-chart'
import type { DashboardFigure } from '@/components/common/figure-tiles'
import { FAMILY_OWING, type Child } from '../children'
import type { QueueItem } from '../features/action-queue'

/** Below this, an attendance figure is flagged. */
const WATCH_ATTENDANCE = 95
/** A full week is five days; anything less is shown in accent. */
const FULL_WEEK = 5

export function figuresFor(child: Child): DashboardFigure[] {
  return [
    {
      label: `Owing for ${child.name}`,
      amount: child.owing,
      format: 'naira',
      delta: child.owing > 0 ? 'Due 30 November' : 'Cleared',
      hot: child.owing > 0,
    },
    {
      label: 'Family total owing',
      amount: FAMILY_OWING,
      format: 'naira',
      delta: 'Across 2 children',
      hot: true,
    },
    {
      label: `${child.name}’s average`,
      amount: child.average,
      format: 'decimal',
      delta: `Position ${child.position}`,
    },
    {
      label: 'Attendance',
      amount: child.attendance,
      format: 'percent',
      delta: 'This term',
      hot: child.attendance < WATCH_ATTENDANCE,
    },
  ]
}

export function attendanceBarsFor(child: Child): Bar[] {
  return child.weeks.map((days, index) => ({
    label: `W${index + 4}`,
    value: days,
    display: `${days}/5`,
    highlight: days < FULL_WEEK,
  }))
}

export function queueFor(child: Child): QueueItem[] {
  const openTest = child.tests.find((test) => test.state === 'Open')
  const watchful = child.attendance < WATCH_ATTENDANCE

  return [
    {
      id: 'owing',
      title: `₦${child.owing.toLocaleString('en-NG')} outstanding for ${child.name}`,
      detail: `${child.invoices[0].fee} · ${child.invoices[0].invoice} · due 30 November`,
      cta: 'Pay',
      to: '/parent/pay',
      urgent: true,
    },
    {
      id: 'test',
      title: openTest ? `${openTest.title} is open` : 'No tests open',
      detail: openTest
        ? `${openTest.subject} · closes ${openTest.closes}`
        : 'Nothing to do here',
      cta: 'Open',
      to: '/parent/tests',
      urgent: true,
    },
    {
      id: 'attendance',
      title: watchful
        ? `${child.name} was marked absent on 15 November`
        : `${child.name}’s attendance is ${child.attendance}%`,
      detail: watchful
        ? 'Unexcused — the office asks for a note'
        : 'One excused absence this term',
      cta: 'View',
      to: '/parent/attendance',
    },
    {
      id: 'results',
      title: 'First term results are partly published',
      detail: `${child.results.length} of 10 subjects approved so far`,
      cta: 'View',
      to: '/parent/results',
    },
  ]
}
