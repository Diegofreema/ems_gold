import type { PageParams } from '../types'

export type Spending = {
  id: number
  amount: number | string
  description: string
  datecreated: string
  user_id: number
}

export type SpendingListParams = PageParams & {
  /** YYYY-MM-DD bounds. */
  from?: string
  to?: string
  q?: string
}

/**
 * `datecreated` and `user_id` are set server-side, so an entry cannot be
 * backdated or attributed to someone else.
 */
export type SpendingBody = {
  amount: number
  description: string
}

export type SpendingMonth = Record<string, unknown>
