/** Admitted-student counts, one bucket per dimension. */
export type BusinessIntelligence = {
  by_class: { count: number; department_id: number }[]
  by_gender: { count: number; gender: string }[]
  by_state: { count: number; state_id: number | null }[]
  by_lga: { count: number; lga_id: number | null }[]
}

/** Both parameters are required — the endpoint compares one subject's grades. */
export type ResultAnalyticsParams = {
  subject_id: number
  session_id: number
}

/** Grade distribution for this session and the last. */
export type ResultAnalytics = Record<string, unknown>

/** Monthly payment totals for this session and the last. */
export type FinancialAnalytics = Record<string, unknown>

export type PaymentListParams = {
  session_id?: number
  limit?: number
}

export type Payment = Record<string, unknown>

/** Asks Interswitch about a reference and settles it locally. */
export type RetryPaymentBody = {
  payref: string
  amount: string
}

/** Asks Remita about an RRR and settles both transaction and invoice. */
export type CheckRrrBody = {
  rrr: string
}
