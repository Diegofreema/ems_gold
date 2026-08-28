import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Column } from './types'

/** The desktop table. Rows are clickable; a trailing chevron cell hints at that. */
export function TableView<TRow>({
  columns,
  rows,
  rowKey,
  onRowClick,
  compact,
}: {
  columns: Column<TRow>[]
  rows: TRow[]
  rowKey: (row: TRow) => string
  onRowClick?: (row: TRow) => void
  compact?: boolean
}) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              className={cn(
                'border-b-2 border-divider p-2 text-[11px] font-normal uppercase tracking-[0.08em] whitespace-nowrap text-muted-foreground',
                column.align === 'right' ? 'text-right' : 'text-left',
              )}
            >
              {column.label}
            </th>
          ))}
          {onRowClick && <th className="w-11 border-b-2 border-divider" />}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr
            key={rowKey(row)}
            onClick={() => onRowClick?.(row)}
            style={{ animationDelay: `${rowIndex * 30}ms` }}
            className={cn(
              'animate-ems-row hover:bg-foreground/4',
              onRowClick && 'cursor-pointer',
            )}
          >
            {columns.map((column, columnIndex) => (
              <td
                key={column.key}
                className={cn(
                  'border-b border-divider tabular-nums',
                  compact ? 'px-2 py-[5px]' : 'px-2 py-[11px]',
                  column.align === 'right' ? 'text-right' : 'text-left',
                  column.nowrap && 'whitespace-nowrap',
                  // The design sets the second column semibold on every table.
                  columnIndex === 1 && 'font-semibold',
                )}
              >
                {column.cell(row)}
              </td>
            ))}
            {onRowClick && (
              <td
                className={cn(
                  'border-b border-divider text-right text-neutral-500',
                  compact ? 'px-2 py-[5px]' : 'px-2 py-[11px]',
                )}
              >
                <ChevronRight
                  className="inline-block size-[15px]"
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
