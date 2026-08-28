import type { Id } from '../types'
import type { CollectionsReportParams, FindStudentParams, OutstandingParams } from './types'

export const collectFeeKeys = {
  all: ['collect-fees'] as const,
  outstanding: (params: OutstandingParams) => [...collectFeeKeys.all, 'outstanding', params] as const,
  paymentMethods: () => [...collectFeeKeys.all, 'payment-methods'] as const,
  studentSearch: (params: Partial<FindStudentParams>) =>
    [...collectFeeKeys.all, 'student-search', params] as const,
  studentInvoices: (studentId: Id, all: boolean) =>
    [...collectFeeKeys.all, 'student', String(studentId), 'invoices', all] as const,
  invoice: (invoiceId: Id) => [...collectFeeKeys.all, 'invoice', String(invoiceId)] as const,
  receipt: (invoiceId: Id) => [...collectFeeKeys.invoice(invoiceId), 'receipt'] as const,
  report: (params: CollectionsReportParams) => [...collectFeeKeys.all, 'report', params] as const,
}
