import { Table2 } from 'lucide-react'
import type { ReactNode } from 'react'

/** The "no records at all" state — distinct from an empty search result. */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="animate-ems-up border-2 border-divider px-6 py-16 text-center">
      <div className="mx-auto grid size-[38px] place-items-center border-2 border-divider text-neutral-600">
        <Table2 className="size-5" strokeWidth={1.8} />
      </div>
      <div className="mt-[18px] font-heading text-[21px] font-extrabold">
        {title}
      </div>
      <p className="mx-auto mt-2 max-w-[46ch] text-[13.5px] text-muted-foreground">
        {body}
      </p>
      {action && <div className="mt-[18px]">{action}</div>}
    </div>
  )
}
