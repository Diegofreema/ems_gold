import type { PageParams } from '../types'
import type { Invoice } from '../invoices/types'
import type { Student } from '../students/types'

export type { Invoice }

/** The four ways a counter payment may be taken. */
export type PaymentMethod = 'cash' | 'bank_transfer' | 'pos' | 'cheque'

export type OutstandingParams = PageParams & {
  /** Matches a pupil's name or registration number. */
  q?: string
}

/** `q` is required — this is a search box, not a list. */
export type FindStudentParams = {
  q: string
  limit?: number
}

export type StudentInvoices = {
  student: Student
  invoices: Invoice[]
}

/**
 * Settles the invoice with no gateway involved. `amount + discount` must equal
 * the invoice exactly; an already-settled invoice is refused with 409.
 */
export type TakePaymentBody = {
  /** Accepts "24,000" as readily as "24000". */
  amount: string
  discount?: number
  payment_method: PaymentMethod
  notes?: string
}

/** Dates default to the current month and are swapped if given backwards. */
export type CollectionsReportParams = {
  start_date?: string
  end_date?: string
  payment_method?: PaymentMethod
}

export type CollectionsReport = {
  range: Record<string, unknown>
  totals: Record<string, unknown>
  /** Amount, discount and entry count per method. */
  by_method: Record<string, unknown>
  payments: Record<string, unknown>[]
}

export type Receipt = Record<string, unknown>
