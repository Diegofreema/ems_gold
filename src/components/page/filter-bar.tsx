import type { ReactNode } from 'react'
import { Input } from '@/components/ui/input'

/** Search on the left (capped at 340px), record count on the right. */
export function FilterBar({
  query,
  onQueryChange,
  placeholder,
  count,
  children,
}: {
  query: string
  onQueryChange: (query: string) => void
  placeholder: string
  /** e.g. "11 pupils". */
  count: string
  /** Extra filter controls, rendered between the search box and the count. */
  children?: ReactNode
}) {
  return (
    <div className="mb-[18px] flex flex-wrap items-center gap-2.5">
      <Input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-[220px] max-w-[340px] flex-1"
      />
      {children}
      <div className="flex-1" />
      <div className="text-xs tabular-nums text-muted-foreground">{count}</div>
    </div>
  )
}
