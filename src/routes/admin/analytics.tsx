import { createFileRoute } from '@tanstack/react-router'
import { BarChart } from '@/components/charts/bar-chart'
import { RateBars } from '@/components/charts/rate-bars'
import { TableView } from '@/components/data-table/table-view'
import { PageHeader } from '@/components/page/page-header'
import { Rule } from '@/components/page/rule'
import { TileStrip } from '@/components/page/tile-strip'
import { Button } from '@/components/ui/button'
import { biTiles, debtors, feeRates, subjectBars } from '@/portals/admin/api/analytics'

export const Route = createFileRoute('/admin/analytics')({
  staticData: { title: 'Analytics', crumb: 'Finance' },
  component: AdminAnalytics,
})

type Debtor = (typeof debtors)[number]

const DEBTOR_COLUMNS = [
  { key: 'parent', label: 'Parent', cell: (row: Debtor) => row.parent },
  { key: 'children', label: 'Children', align: 'right' as const, cell: (row: Debtor) => row.children },
  { key: 'owing', label: 'Owing', align: 'right' as const, cell: (row: Debtor) => row.owing },
  { key: 'days', label: 'Days overdue', align: 'right' as const, cell: (row: Debtor) => row.days },
]

function AdminAnalytics() {
  return (
    <div>
      <PageHeader
        kicker="Finance"
        title="Analytics"
        description="Collection performance and academic outcomes for the current session. Figures refresh nightly."
        action={<Button>Export report</Button>}
      />
      <Rule />

      <TileStrip tiles={biTiles} size="lg" />
      <Rule className="mt-7" />

      <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
        <section>
          <h4 className="mb-0.5 text-xl">Collection rate by fee</h4>
          <p className="text-[12.5px] text-muted-foreground">
            Share of the billed amount that has been paid.
          </p>
          <RateBars rates={feeRates} />
        </section>

        <section>
          <h4 className="mb-0.5 text-xl">Pass rate by subject</h4>
          <p className="text-[12.5px] text-muted-foreground">
            Share scoring 50 or above, mid-term.
          </p>
          <BarChart bars={subjectBars} peak={100} />
        </section>
      </div>

      <Rule className="mt-8" />
      <h4 className="mb-3.5 text-xl">Largest outstanding balances</h4>
      <div className="overflow-x-auto border-2 border-divider">
        <TableView columns={DEBTOR_COLUMNS} rows={debtors} rowKey={(row) => row.id} />
      </div>
    </div>
  )
}
