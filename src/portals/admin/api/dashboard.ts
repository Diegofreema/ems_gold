import { queryOptions } from '@tanstack/react-query'
import { invoicesService } from '@/api/invoices/service'
import { logsService } from '@/api/logs/service'
import { spendingsService } from '@/api/spendings/service'
import { usersService } from '@/api/users/service'
import type { Bar } from '@/components/charts/bar-chart'
import type { ActivityEntry } from '@/components/common/activity-list'
import type { DashboardFigure } from '@/components/common/figure-tiles'
import type { Tile } from '@/components/page/tile-strip'
import {
  activityEntries,
  collectionBars,
  financeFigures,
  ledgerTotals,
  peopleFigures,
  schoolTiles,
} from '../features/dashboard/dashboard'

export type AdminDashboard = {
  money: DashboardFigure[]
  people: DashboardFigure[]
  school: Tile[]
  collections: { bars: Bar[]; peak: number }
  activity: ActivityEntry[]
}

/**
 * How much of the invoice register is totalled for the money tiles.
 *
 * There is no endpoint that adds the ledger up server-side: `/collect-fees`
 * counts one session and only the part still owing, and the dashboard
 * endpoint's own money figures do not reconcile with the invoices they claim
 * to total. So the register is pulled and added up here.
 *
 * ponytail: a whole-ledger scan, fine at a few hundred invoices and not at
 * tens of thousands — a school billing three fees a term reaches that in a few
 * years. Swap it for a server-side total the moment the API grows one.
 */
const LEDGER_SCAN = 500

/** How many audit entries the feed beside the chart has room for. */
const FEED_SIZE = 6

/**
 * Everything the admin home page shows, from the four endpoints that between
 * them hold it: the counters, the invoice register, the spending summary and
 * the audit log.
 *
 * The counters answer for people and the register for money, deliberately.
 * `/users/dashboard` also sends `total_revenue`, `fees_collected` and a
 * revenue series, and those three disagree with one another and with the
 * invoices on file — a school with settled invoices reads `total_revenue: 0` —
 * so nothing here reads them.
 */
async function fetchDashboard(): Promise<AdminDashboard> {
  const [counters, invoices, spending, logs] = await Promise.all([
    usersService.dashboard(),
    invoicesService.list({ limit: LEDGER_SCAN }),
    spendingsService.summary(),
    logsService.list({ limit: FEED_SIZE }),
  ])

  const today = new Date()
  return {
    money: financeFigures(ledgerTotals(invoices.items), spending, today),
    people: peopleFigures(counters.stats),
    school: schoolTiles(counters.stats),
    collections: collectionBars(invoices.items, today),
    activity: activityEntries(logs.items, today),
  }
}

export const adminDashboardQuery = queryOptions({
  queryKey: ['admin', 'dashboard'],
  queryFn: fetchDashboard,
})
