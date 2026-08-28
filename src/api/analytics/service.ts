import { request } from '../client'
import type {
  BusinessIntelligence,
  CheckRrrBody,
  FinancialAnalytics,
  Payment,
  PaymentListParams,
  ResultAnalytics,
  ResultAnalyticsParams,
  RetryPaymentBody,
} from './types'

export const analyticsService = {
  businessIntelligence: () =>
    request<BusinessIntelligence>('admins/business-intelligence'),

  results: (params: ResultAnalyticsParams) =>
    request<ResultAnalytics>('admins/result-analytics', { query: { ...params } }),

  financial: (sessionId?: number) =>
    request<FinancialAnalytics>('admins/financial-analytics', {
      query: { session_id: sessionId },
    }),

  /** Settled transactions only. */
  payments: (params: PaymentListParams = {}) =>
    request<{ payments: Payment[] }>('admins/payments', { query: { ...params } }).then(
      (data) => data.payments,
    ),

  retryPayment: (body: RetryPaymentBody) =>
    request<unknown>('admins/payments/retry', { method: 'POST', body }),

  checkRrr: (body: CheckRrrBody) =>
    request<unknown>('admins/payments/check-rrr', { method: 'POST', body }),
}
