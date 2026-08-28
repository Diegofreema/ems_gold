import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { SquareCheckBig } from 'lucide-react'
import { BarChart } from '@/components/charts/bar-chart'
import { FigureTiles } from '@/components/common/figure-tiles'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'
import { studentDashboardQuery } from '@/portals/student/api/dashboard'
import { WeekList } from '@/portals/student/features/week-list'

export const Route = createFileRoute('/student/')({
  staticData: { title: 'Dashboard', crumb: 'NETPRO EMS Bronze' },
  loader: ({ context }) => context.queryClient.ensureQueryData(studentDashboardQuery),
  component: StudentDashboard,
})

function StudentDashboard() {
  const { data } = useSuspenseQuery(studentDashboardQuery)

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-page-title">Hello, Amara.</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            One test is open and closes on Friday. Your fees are cleared for this
            term.
          </p>
        </div>
        <Button asChild>
          <Link to="/student/tests">
            <SquareCheckBig className="size-[15px]" strokeWidth={2} />
            Open tests
          </Link>
        </Button>
      </div>
      <Rule />

      <FigureTiles figures={data.figures} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <section>
          <h4 className="mb-0.5 text-xl">This week</h4>
          <p className="text-[12.5px] text-muted-foreground">
            Tests, submissions and deadlines.
          </p>
          <WeekList items={data.week} />
        </section>

        <section>
          <h4 className="mb-0.5 text-xl">My scores</h4>
          <p className="text-[12.5px] text-muted-foreground">
            Mid-term totals out of 100.
          </p>
          <BarChart bars={data.scores} peak={100} />
        </section>
      </div>
    </>
  )
}
