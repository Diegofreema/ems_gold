import { Link } from '@tanstack/react-router'
import { Lock } from 'lucide-react'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'

const ROWS = (pageName: string) => [
  { label: 'Page', value: pageName },
  { label: 'Ask', value: 'The school office — 0803 000 0000' },
]

/** Shown when the account lacks the privilege a route needs. */
export function DeniedState({
  pageName,
  dashboardPath,
  onRequestAccess,
}: {
  pageName: string
  dashboardPath: string
  onRequestAccess: () => void
}) {
  return (
    <div className="max-w-[580px] py-10">
      <div className="grid size-10 place-items-center bg-brand text-background">
        <Lock className="size-[21px]" strokeWidth={2.1} />
      </div>
      <h2 className="mt-5 text-page-title">You cannot open this page</h2>
      <p className="mt-2.5 text-sm text-muted-foreground">
        Your account does not carry the privilege this page needs. Nothing was
        changed, and the attempt is written to the activity log.
      </p>

      <div className="mt-[18px] border-t-2 border-divider">
        {ROWS(pageName).map((row) => (
          <div
            key={row.label}
            className="flex gap-4 border-b border-divider px-0.5 py-3"
          >
            <div className="w-2/5 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              {row.label}
            </div>
            <div className="flex-1 text-sm">{row.value}</div>
          </div>
        ))}
      </div>

      <Rule />
      <div className="flex flex-wrap gap-2.5">
        <Button asChild>
          <Link to={dashboardPath}>Back to dashboard</Link>
        </Button>
        <Button variant="outline" onClick={onRequestAccess}>
          Request access
        </Button>
      </div>
    </div>
  )
}
