import type { PaymentListParams, ResultAnalyticsParams } from './types'

export const analyticsKeys = {
  all: ['analytics'] as const,
  businessIntelligence: () => [...analyticsKeys.all, 'bi'] as const,
  results: (params: ResultAnalyticsParams) => [...analyticsKeys.all, 'results', params] as const,
  financial: (sessionId?: number) => [...analyticsKeys.all, 'financial', sessionId] as const,
  payments: (params: PaymentListParams) => [...analyticsKeys.all, 'payments', params] as const,
}
