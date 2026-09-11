import { Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { Input } from '@/components/ui/input'

/**
 * The row over a register: search on the left, whatever narrows it beside
 * that, and the page's own action at the end.
 *
 * The action used to sit up beside the page title. It is here because that is
 * where somebody's eye already is — they have just read the title, and the
 * next thing they do is either look for a row or add one.
 */
export function FilterBar({
  query,
  onQueryChange,
  placeholder,
  count,
  action,
  children,
  searchable = true,
}: {
  query: string
  onQueryChange: (query: string) => void
  placeholder: string
  /** e.g. "11 students". */
  count: string
  /** The register's primary button, at the end of the row. */
  action?: ReactNode
  /** Extra filter controls, rendered between the search box and the count. */
  children?: ReactNode
  /** False where the endpoint takes no search term, so the box is left out. */
  searchable?: boolean
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-2.5">
      {searchable && (
        <div className="relative min-w-[220px] flex-1 md:max-w-[360px]">
          <Search
            className="pointer-events-none absolute inset-y-0 left-4 my-auto size-4.5 text-ui-hint"
            strokeWidth={1.9}
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="pl-11"
          />
        </div>
      )}
      {children}
      {/* Pinned right rather than pushed there by a spacer: when the filters
          wrap onto a second line the button stays at the end of the row
          instead of landing under the search box. */}
      <div className="ml-auto flex items-center gap-3">
        <div className="text-sm tabular-nums text-muted-foreground">{count}</div>
        {action}
      </div>
    </div>
  )
}
