import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { PenLine } from 'lucide-react'
import { BarChart } from '@/components/charts/bar-chart'
import { FigureTiles } from '@/components/common/figure-tiles'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'
import { useFirstName } from '@/features/auth/session'
import { teacherDashboardQuery } from '@/portals/teacher/api/dashboard'
import { TimetableList } from '@/portals/teacher/features/timetable-list'

export const Route = createFileRoute('/teacher/')({
  staticData: { title: 'Dashboard', crumb: 'NETPRO EMS Bronze' },
  loader: ({ context }) => context.queryClient.ensureQueryData(teacherDashboardQuery),
  component: TeacherDashboard,
})

function TeacherDashboard() {
  const name = useFirstName('Chukwuma')
  const { data } = useSuspenseQuery(teacherDashboardQuery)

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-page-title">Good morning, {name}.</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Two score sheets are still open for this term. Everything else is
            submitted.
          </p>
        </div>
        <Button asChild>
          <Link to="/teacher/scores">
            <PenLine className="size-[15px]" strokeWidth={2} />
            Enter scores
          </Link>
        </Button>
      </div>
      <Rule />

      <FigureTiles figures={data.figures} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <section>
          <h4 className="mb-0.5 text-xl">Today’s timetable</h4>
          <p className="text-[12.5px] text-muted-foreground">
            Your periods, in order.
          </p>
          <TimetableList periods={data.timetable} />
        </section>

        <section>
          <h4 className="mb-0.5 text-xl">Class averages</h4>
          <p className="text-[12.5px] text-muted-foreground">
            Mid-term, out of 100.
          </p>
          <BarChart bars={data.armAverages} peak={100} />
        </section>
      </div>
    </>
  )
}
