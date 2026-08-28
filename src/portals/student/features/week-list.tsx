import { Tag } from '@/components/common/tag'

export type WeekItem = {
  id: string
  day: string
  title: string
  subject: string
  state: 'Open' | 'Due' | 'Booked' | 'Deadline'
}

/** Anything that needs doing now reads in accent; the rest are outlined. */
const URGENT: WeekItem['state'][] = ['Open', 'Deadline']

/** Tests, submissions and deadlines for the week ahead. */
export function WeekList({ items }: { items: WeekItem[] }) {
  return (
    <div className="mt-3.5 border-t-2 border-divider">
      {items.map((item, index) => (
        <div
          key={item.id}
          style={{ animationDelay: `${index * 50}ms` }}
          className="flex animate-ems-row items-baseline gap-3.5 border-b border-divider px-1 py-3"
        >
          <div className="w-[78px] flex-none text-[12.5px] text-neutral-600">
            {item.day}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">{item.title}</div>
            <div className="mt-0.5 text-[11.5px] text-muted-foreground">
              {item.subject}
            </div>
          </div>
          <Tag variant={URGENT.includes(item.state) ? 'accent' : 'outline'}>
            {item.state}
          </Tag>
        </div>
      ))}
    </div>
  )
}
