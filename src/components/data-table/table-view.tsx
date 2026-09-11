import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Column, RowAction } from './types'

/**
 * The desktop table: a filled header band, roomy rows and no rules between
 * them — the design separates rows by air, and a line under every one of forty
 * is a page of lines. The row still lifts on hover, which is what says it can
 * be opened.
 */
export function TableView<TRow>({
  columns,
  rows,
  rowKey,
  onRowClick,
  action,
  compact,
}: {
  columns: Column<TRow>[]
  rows: TRow[]
  rowKey: (row: TRow) => string
  onRowClick?: (row: TRow) => void
  action?: RowAction<TRow>
  compact?: boolean
}) {
  // The design sets the record's name semibold. Column sets that declare a
  // card title say which one that is; the rest follow the second-column rule.
  const titleIndex = columns.findIndex((column) => column.cardRole === 'title')
  const boldIndex = titleIndex === -1 ? 1 : titleIndex

  return (
    <table className="w-full border-separate border-spacing-0 text-[15px]">
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              className={cn(
                'bg-ui-line px-4 py-3.5 text-sm font-medium whitespace-nowrap text-foreground first:rounded-l-lg last:rounded-r-lg',
                column.align === 'right' ? 'text-right' : 'text-left',
              )}
            >
              {column.label}
            </th>
          ))}
          {action && <th className="bg-ui-line last:rounded-r-lg" />}
          {onRowClick && (
            <th className="w-14 bg-ui-line px-4 py-3.5 text-right text-sm font-medium last:rounded-r-lg">
              <span className="sr-only">Open</span>
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr
            key={rowKey(row)}
            onClick={() => onRowClick?.(row)}
            style={{ animationDelay: `${rowIndex * 30}ms` }}
            className={cn(
              'animate-ems-row transition-colors hover:bg-ui-line/70',
              onRowClick && 'cursor-pointer',
            )}
          >
            {columns.map((column, columnIndex) => (
              <td
                key={column.key}
                className={cn(
                  'tabular-nums',
                  compact ? 'px-4 py-2' : 'px-4 py-4',
                  column.align === 'right' ? 'text-right' : 'text-left',
                  column.nowrap && 'whitespace-nowrap',
                  columnIndex === boldIndex && 'font-semibold',
                )}
              >
                {column.cell(row)}
              </td>
            ))}
            {/* The row itself opens the record, so the cell holding the
                button stops the click getting that far. */}
            {action && (
              <td
                className={cn(
                  'text-right',
                  compact ? 'px-4 py-2' : 'px-4 py-2.5',
                )}
                onClick={(event) => event.stopPropagation()}
              >
                <RowActionButton row={row} action={action} />
              </td>
            )}
            {onRowClick && (
              <td
                className={cn(
                  'text-right text-neutral-500',
                  compact ? 'px-4 py-2' : 'px-4 py-4',
                )}
              >
                <ChevronRight
                  className="inline-block size-3.75"
                  strokeWidth={2}
                />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function RowActionButton<TRow>({
  row,
  action,
}: {
  row: TRow
  action: RowAction<TRow>
}) {
  const label = action.label(row)
  if (!label) return null

  return (
    <Button
      variant="outline"
      size="sm"
      pending={action.pending?.(row)}
      onClick={() => action.onSelect(row)}
    >
      {label}
    </Button>
  )
}
