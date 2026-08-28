import { Rule } from '@/components/page/rule'
import { PAGE_SIZE } from '@/hooks/use-list-query'
import { Shimmer } from './shimmer'

/** Column weights the design uses for its skeleton rows. */
const CELL_WEIGHTS = [3, 2, 2, 1]

export function ListSkeleton({ label }: { label: string }) {
  return (
    <div>
      <Shimmer className="h-3 w-30" />
      <Shimmer className="mt-3.5 h-[34px] w-80" />
      <Rule />

      <div className="border-2 border-divider">
        {Array.from({ length: PAGE_SIZE }, (_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex gap-4 border-b border-divider px-3 py-3.5"
          >
            {CELL_WEIGHTS.map((grow, cellIndex) => (
              <Shimmer
                key={cellIndex}
                className="h-[11px]"
                style={{ flex: grow }}
                delay={(rowIndex * CELL_WEIGHTS.length + cellIndex) * 40}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-3.5 text-xs text-muted-foreground">Loading {label}…</div>
    </div>
  )
}
