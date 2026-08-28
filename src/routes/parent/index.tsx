import { createFileRoute, Link } from '@tanstack/react-router'
import { CreditCard } from 'lucide-react'
import { BarChart } from '@/components/charts/bar-chart'
import { FigureTiles } from '@/components/common/figure-tiles'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'
import {
  attendanceBarsFor,
  figuresFor,
  queueFor,
} from '@/portals/parent/api/dashboard'
import { ActionQueue } from '@/portals/parent/features/action-queue'
import { useSelectedChild } from '@/portals/parent/parent.store'

export const Route = createFileRoute('/parent/')({
  staticData: { title: 'Dashboard', crumb: 'Overview' },
  component: ParentDashboard,
})

function ParentDashboard() {
  const child = useSelectedChild()

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-page-title">Good morning, Mr. Udo.</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Two invoices are outstanding and one test is open for {child.name}.
          </p>
        </div>
        <Button asChild>
          <Link to="/parent/pay">
            <CreditCard className="size-[15px]" strokeWidth={2} />
            Pay fees
          </Link>
        </Button>
      </div>
      <Rule />

      {/* Keyed on the child so the figures count up again on a switch. */}
      <FigureTiles key={child.adm} figures={figuresFor(child)} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <section>
          <h4 className="mb-0.5 text-xl">What needs you</h4>
          <p className="text-[12.5px] text-muted-foreground">
            Sorted by how soon it matters.
          </p>
          <ActionQueue items={queueFor(child)} />
        </section>

        <section>
          <h4 className="mb-0.5 text-xl">Attendance, last 6 weeks</h4>
          <p className="text-[12.5px] text-muted-foreground">
            {child.full}, days present out of 5.
          </p>
          <BarChart key={child.adm} bars={attendanceBarsFor(child)} peak={5} />
        </section>
      </div>
    </>
  )
}
