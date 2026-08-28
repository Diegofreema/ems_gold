import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { invoiceKeys } from '../invoices/keys'
import type { Id } from '../types'
import { collectFeeKeys } from './keys'
import { collectFeesService } from './service'
import type {
  CollectionsReportParams,
  FindStudentParams,
  OutstandingParams,
  TakePaymentBody,
} from './types'

export function useOutstandingInvoices(params: OutstandingParams = {}) {
  return useQuery({
    queryKey: collectFeeKeys.outstanding(params),
    queryFn: () => collectFeesService.outstanding(params),
  })
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: collectFeeKeys.paymentMethods(),
    queryFn: () => collectFeesService.paymentMethods(),
    staleTime: Infinity,
  })
}

/** Idle until something is typed — the endpoint requires a search term. */
export function useFindStudents(params: Partial<FindStudentParams>) {
  return useQuery({
    queryKey: collectFeeKeys.studentSearch(params),
    queryFn: () => collectFeesService.findStudents(params as FindStudentParams),
    enabled: Boolean(params.q),
  })
}

export function useCollectStudentInvoices(studentId: Id | undefined, all = false) {
  return useQuery({
    queryKey: collectFeeKeys.studentInvoices(studentId ?? '', all),
    queryFn: () => collectFeesService.studentInvoices(studentId!, all),
    enabled: studentId !== undefined,
  })
}

export function useCollectInvoice(invoiceId: Id | undefined) {
  return useQuery({
    queryKey: collectFeeKeys.invoice(invoiceId ?? ''),
    queryFn: () => collectFeesService.invoice(invoiceId!),
    enabled: invoiceId !== undefined,
  })
}

/**
 * Taking a payment settles the invoice outright, so every view of money —
 * the counter queue, the invoice ledger, the report — is stale afterwards.
 */
export function useTakePayment(invoiceId: Id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: TakePaymentBody) => collectFeesService.pay(invoiceId, body),
    meta: { success: 'Payment recorded' },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectFeeKeys.all })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all })
    },
  })
}

export function useCollectReceipt(invoiceId: Id | undefined) {
  return useQuery({
    queryKey: collectFeeKeys.receipt(invoiceId ?? ''),
    queryFn: () => collectFeesService.receipt(invoiceId!),
    enabled: invoiceId !== undefined,
  })
}

export function useCollectionsReport(params: CollectionsReportParams = {}) {
  return useQuery({
    queryKey: collectFeeKeys.report(params),
    queryFn: () => collectFeesService.report(params),
  })
}
