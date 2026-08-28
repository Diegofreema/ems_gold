import { Button } from '@/components/ui/button'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { CardView } from './card-view'
import { TableView } from './table-view'
import type { Column } from './types'

/**
 * Chooses the table or the card layout for the viewport, and owns the
 * "nothing matches your search" state that sits inside the same 2px frame.
 */
export function DataTable<TRow>({
  columns,
  rows,
  rowKey,
  onRowClick,
  onEdit,
  onDelete,
  compact,
  searchQuery,
  onClearSearch,
}: {
  columns: Column<TRow>[]
  rows: TRow[]
  rowKey: (row: TRow) => string
  onRowClick?: (row: TRow) => void
  onEdit?: (row: TRow) => void
  onDelete?: (row: TRow) => void
  compact?: boolean
  searchQuery?: string
  onClearSearch?: () => void
}) {
  const phone = useBreakpoint('phone')

  return (
    <div className="overflow-x-auto border-2 border-divider">
      {phone ? (
        <CardView
          columns={columns}
          rows={rows}
          rowKey={rowKey}
          onRowClick={onRowClick}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <TableView
          columns={columns}
          rows={rows}
          rowKey={rowKey}
          onRowClick={onRowClick}
          compact={compact}
        />
      )}

      {rows.length === 0 && (
        <div className="px-6 py-14 text-center">
          <div className="font-heading text-[17px] font-extrabold">
            {searchQuery ? `Nothing matches “${searchQuery}”` : 'Nothing to show'}
          </div>
          {searchQuery && (
            <>
              <p className="mt-1.5 text-[13px] text-muted-foreground">
                Clear the search to see the full register.
              </p>
              <Button variant="outline" className="mt-2" onClick={onClearSearch}>
                Clear search
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
