import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import type { AssignmentPaper } from '@/api/assignments/types'
import { Tag } from '@/components/common/tag'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'
import { toneForStatus } from '@/lib/status-tone'
import { paperFields, paperMeta } from './paper'

/**
 * A paper before it is sat, or once it can no longer be: its terms, its state,
 * and the one thing the pupil can do about it.
 *
 * The same panel serves all three ways in — start it, you already did, you
 * cannot — because they differ only in the tag at the top and the button at
 * the bottom, and splitting them would be three copies of the same list of
 * terms.
 */
export function PaperBrief({
  paper,
  state,
  note,
  action,
}: {
  paper: AssignmentPaper
  state: string
  note: string
  action?: ReactNode
}) {
  const title = paper.assignment?.title?.trim() || 'This test'
  const details = paper.assignment?.details?.trim()

  return (
    <div className="max-w-[720px]">
      <div className="text-[10px] uppercase tracking-[0.12em] text-brand-700">
        Computer-based test
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h2 className="text-page-title">{title}</h2>
        <Tag variant={toneForStatus(state)}>{state}</Tag>
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">{paperMeta(paper)}</p>
      <Rule />

      {details && (
        <p className="mb-6 border-l-2 border-brand pl-4 text-[15px] leading-relaxed">
          {details}
        </p>
      )}

      <div className="border-2 border-foreground">
        {paperFields(paper).map((field, index) => (
          <div
            key={field.label}
            style={{ animationDelay: `${index * 30}ms` }}
            className="flex animate-ems-row gap-4 border-b border-divider px-5 py-3 last:border-b-0"
          >
            <div className="w-[44%] text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              {field.label}
            </div>
            <div className="flex-1 text-sm tabular-nums">{field.value}</div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">{note}</p>
      <Rule />

      <div className="flex flex-wrap gap-2.5">
        {action}
        <Button asChild variant="outline">
          <Link to="/student/tests">Back to my tests</Link>
        </Button>
      </div>
    </div>
  )
}
