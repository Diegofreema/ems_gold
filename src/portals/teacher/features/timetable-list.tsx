import { Tag } from '@/components/common/tag'

export type Period = {
  id: string
  time: string
  subject: string
  arm: string
  room: string
  state: 'Taught' | 'Next' | 'Later'
}

const TONES = {
  Next: 'accent',
  Taught: 'neutral',
  Later: 'outline',
} as const

/** Today's periods, in order, with the one coming up flagged in accent. */
export function TimetableList({ periods }: { periods: Period[] }) {
  return (
    <div className="mt-3.5 border-t-2 border-divider">
      {periods.map((period, index) => (
        <div
          key={period.id}
          style={{ animationDelay: `${index * 50}ms` }}
          className="flex animate-ems-row items-baseline gap-3.5 border-b border-divider px-1 py-3"
        >
          <div className="w-24 flex-none text-[12.5px] tabular-nums text-neutral-600">
            {period.time}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">{period.subject}</div>
            <div className="mt-0.5 text-[11.5px] text-muted-foreground">
              {period.arm} · {period.room}
            </div>
          </div>
          <Tag variant={TONES[period.state]}>{period.state}</Tag>
        </div>
      ))}
    </div>
  )
}
