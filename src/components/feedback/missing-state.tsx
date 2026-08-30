import { SearchX } from 'lucide-react'
import type { ReactNode } from 'react'
import { Rule } from '@/components/page/rule'

/**
 * A record that was asked for and did not come back.
 *
 * Distinct from the portal's 404, which says the URL leads nowhere: this says
 * the page is right and the data is not there. It keeps the shell, the
 * breadcrumb and the way back, so the office can leave without the browser's
 * back button — and it takes the facts a report needs, because "not found" on
 * its own tells whoever is asked to look into it nothing at all.
 */
export function MissingState({
  title,
  body,
  rows,
  action,
}: {
  title: string
  body: string
  /** What was asked for, for whoever has to chase it. */
  rows?: { label: string; value: string }[]
  action?: ReactNode
}) {
  return (
    <div className="max-w-[580px] py-2">
      <div className="grid size-10 place-items-center bg-brand text-background">
        <SearchX className="size-[21px]" strokeWidth={2.1} />
      </div>
      <h2 className="mt-5 text-page-title">{title}</h2>
      <p className="mt-2.5 max-w-[60ch] text-sm text-muted-foreground">{body}</p>

      {rows && rows.length > 0 && (
        <div className="mt-[18px] border-t-2 border-divider">
          {rows.map((row) => (
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
      )}

      {action && (
        <>
          <Rule />
          <div className="flex flex-wrap gap-2.5">{action}</div>
        </>
      )}
    </div>
  )
}
