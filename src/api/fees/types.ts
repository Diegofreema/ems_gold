import type { PageParams } from '../types'

export type Fee = {
  id: number
  name: string
  /** Normalised to an integer server-side, but returned as a string. */
  amount: string | number
  feetype: FeeType
  itemcode: string | null
  status: number
  user_id: number
  departments?: { id: number; name: string }[]
  levels?: { id: number; name: string }[]
  /** How many invoices, transactions and transcript requests point at it. */
  dependencies?: Record<string, number>
}

/** The only two the API accepts. */
export type FeeType = 'enrolled' | 'none_enrolled'

export type FeeListParams = PageParams & {
  /** 1 for active, 0 for inactive. */
  status?: 0 | 1
  feetype?: FeeType
  /** Matches the fee name or the item code. */
  q?: string
}

/** The classes, levels and fee types the create and edit forms offer. */
export type FeeOptions = Record<string, unknown>

/**
 * `amount` accepts "30,000" and "30000.00" alike. Passing `departments` or
 * `levels` replaces that whole set.
 */
export type FeeBody = {
  name: string
  amount: string
  feetype: FeeType
  itemcode?: string
  departments?: number[]
  levels?: number[]
}

/**
 * `departments` replaces the whole set, so `[]` clears it. `levels` is only
 * touched when the key is present.
 */
export type AllocateFeeBody = {
  departments: number[]
  levels?: number[]
}
