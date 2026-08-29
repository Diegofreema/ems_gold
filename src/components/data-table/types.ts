import type { ReactNode } from 'react'

import type { Align, CardRole } from '@/lib/table'

export type { CardRole }

/**
 * A button rendered on every row. `label` reads the row, so an action that
 * toggles a state names the one the row is not in — and returning nothing
 * leaves that row without a button at all.
 */
export type RowAction<TRow> = {
  label: (row: TRow) => string | undefined
  onSelect: (row: TRow) => void
}

export type Column<TRow> = {
  key: string
  label: string
  align?: Align
  cell: (row: TRow) => ReactNode
  cardRole?: CardRole
  /** Keeps the cell on one line — used for dates and amounts. */
  nowrap?: boolean
}
