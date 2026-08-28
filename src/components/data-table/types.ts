import type { ReactNode } from 'react'

import type { Align, CardRole } from '@/lib/table'

export type { CardRole }

export type Column<TRow> = {
  key: string
  label: string
  align?: Align
  cell: (row: TRow) => ReactNode
  cardRole?: CardRole
  /** Keeps the cell on one line — used for dates and amounts. */
  nowrap?: boolean
}
