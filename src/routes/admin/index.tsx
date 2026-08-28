import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ChartColumn } from 'lucide-react'
import { ActivityList } from '@/components/common/activity-list'
import { SectionHeading } from '@/components/common/section-heading'
import { BarChart } from '@/components/charts/bar-chart'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'
import { adminDashboardQuery } from '@/portals/admin/api/dashboard'
import { FigureTiles } from '@/components/common/figure-tiles'

export const Route = createFileRoute('/admin/')({
  staticData: { title: 'Dashboard', crumb: 'NETPRO EMS Bronze' },
  loader: ({ context }) => context.queryClient.ensureQueryData(adminDashboardQuery),
  component: AdminDashboard,
})

function AdminDashboard() {
  const { data } = useSuspenseQuery(adminDashboardQuery)

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-page-title">Good morning, Amaka.</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Term-to-date position across money and people. Figures update as
            payments clear.
          </p>
        </div>
        <Button>
          <ChartColumn className="size-[15px]" strokeWidth={2} />
          Business intelligence
        </Button>
      </div>
      <Rule />

      <SectionHeading className="mb-3">Finance</SectionHeading>
      <FigureTiles figures={data.money} />

      <SectionHeading className="mt-7 mb-3">People</SectionHeading>
      <FigureTiles figures={data.people} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
        <section>
          <h4 className="mb-0.5 text-xl">Fee collections</h4>
          <p className="text-[12.5px] text-muted-foreground">
            Naira collected per month, current session.
          </p>
          <BarChart bars={data.collections.bars} peak={data.collections.peak} />
        </section>

        <section>
          <h4 className="mb-0.5 text-xl">Latest activity</h4>
          <p className="text-[12.5px] text-muted-foreground">
            Everything is written to the audit log.
          </p>
          <ActivityList entries={data.activity} />
        </section>
      </div>
    </>
  )
}
