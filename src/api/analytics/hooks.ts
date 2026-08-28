import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { analyticsKeys } from './keys'
import { analyticsService } from './service'
import type {
  CheckRrrBody,
  PaymentListParams,
  ResultAnalyticsParams,
  RetryPaymentBody,
} from './types'

export function useBusinessIntelligence() {
  return useQuery({
    queryKey: analyticsKeys.businessIntelligence(),
    queryFn: () => analyticsService.businessIntelligence(),
  })
}

/** Idle until both ids are known, since the endpoint requires them. */
export function useResultAnalytics(params: Partial<ResultAnalyticsParams>) {
  const ready = params.subject_id !== undefined && params.session_id !== undefined
  return useQuery({
    queryKey: analyticsKeys.results(params as ResultAnalyticsParams),
    queryFn: () => analyticsService.results(params as ResultAnalyticsParams),
    enabled: ready,
  })
}

export function useFinancialAnalytics(sessionId?: number) {
  return useQuery({
    queryKey: analyticsKeys.financial(sessionId),
    queryFn: () => analyticsService.financial(sessionId),
  })
}

export function usePayments(params: PaymentListParams = {}) {
  return useQuery({
    queryKey: analyticsKeys.payments(params),
    queryFn: () => analyticsService.payments(params),
  })
}

/** Both of these settle money, so the payment list is refetched after. */
export function useRetryPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: RetryPaymentBody) => analyticsService.retryPayment(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: analyticsKeys.all }),
  })
}

export function useCheckRrr() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CheckRrrBody) => analyticsService.checkRrr(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: analyticsKeys.all }),
  })
}
