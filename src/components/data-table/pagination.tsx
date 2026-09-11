import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Paged } from '@/hooks/use-list-query'
import { cn } from '@/lib/utils'

/** How many numbered buttons before the run is cut with an ellipsis. */
const WINDOW = 3

/**
 * The pages, as numbers rather than as Previous and Next.
 *
 * A register of forty pages is one somebody jumps around in — page 1 to check
 * the newest, the last page to check the oldest — and two arrows make that
 * thirty-nine clicks. The window is the first few pages, the page you are on,
 * and the last, with the gap between them shown as a gap.
 */
function pages(current: number, last: number): (number | 'gap')[] {
  if (last <= WINDOW + 2) {
    return Array.from({ length: last }, (_, index) => index + 1)
  }
  const head = Array.from({ length: WINDOW }, (_, index) => index + 1)
  const out: (number | 'gap')[] = [...head]
  if (current > WINDOW && current < last) out.push('gap', current)
  else out.push('gap')
  out.push(last)
  return out
}

export function Pagination<T>({
  page,
  paged,
  footer,
  onPageChange,
}: {
  page: number
  paged: Paged<T>
  /** Left-hand note, e.g. "Showing 6 of 6 fees · First Term 2025/2026". */
  footer?: string
  onPageChange: (page: number) => void
}) {
  const last = Math.max(1, Math.ceil(paged.total / Math.max(paged.to - paged.from + 1, 1)))

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <div className="text-sm text-muted-foreground">
        Showing {paged.from} to {paged.to} of {paged.total}{' '}
        {paged.total === 1 ? 'entry' : 'entries'}
        {footer && <span className="ml-1.5">· {footer}</span>}
      </div>

      <div className="flex items-center gap-1.5">
        <Step
          label="Previous page"
          disabled={paged.isFirstPage}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4.5" strokeWidth={2} />
        </Step>

        {pages(page, last).map((entry, index) =>
          entry === 'gap' ? (
            <span
              key={`gap-${index}`}
              className="px-1 text-sm text-muted-foreground"
              aria-hidden="true"
            >
              ·····
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => onPageChange(entry)}
              aria-current={entry === page ? 'page' : undefined}
              className={cn(
                'size-9 cursor-pointer rounded-full text-sm tabular-nums transition-colors',
                entry === page
                  ? 'bg-brand font-medium text-white'
                  : 'text-muted-foreground hover:bg-ui-line hover:text-foreground',
              )}
            >
              {entry}
            </button>
          ),
        )}

        <Step
          label="Next page"
          disabled={paged.isLastPage}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="size-4.5" strokeWidth={2} />
        </Step>
      </div>
    </div>
  )
}

function Step({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-9 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-ui-line hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  )
}
