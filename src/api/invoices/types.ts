import type { PageParams } from '../types.ts'

export type Invoice = {
  id: number
  fee_id: number | null
  student_id: number
  session_id: number | null
  /** Amounts come back as strings from this API. */
  amount: string
  paystatus: string
  /** The human reference printed on the invoice, e.g. `TSS1/16`. */
  invoiceid: string | null
  createdate: string
  payday: string | null
  student?: Record<string, unknown>
  fee?: Record<string, unknown>
  /** Set when the pupil's row has since been deleted. */
  student_missing?: boolean
}

export type InvoiceListParams = PageParams & {
  fee_id?: number
  status?: string
  /** Each bound applies on its own, so a single-sided range works. */
  startdate?: string
  enddate?: string
}

export type InvoiceBody = {
  fee_id: number
  student_id: number
  session_id: number
  amount: string
  paystatus?: string
  invoiceid?: string
}

/**
 * Marks the invoice paid and closes its transaction. The pupil is named so a
 * mistyped invoice number cannot settle someone else's bill.
 */
export type SettleInvoiceBody = {
  student_id: number
}

export type Payment = Record<string, unknown>
