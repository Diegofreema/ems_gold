import { paginated, request } from '../client'
import type { Id } from '../types'
import type { Invoice } from '../invoices/types'
import type { Student } from '../students/types'
import type {
  CollectionsReport,
  CollectionsReportParams,
  FindStudentParams,
  OutstandingParams,
  PaymentMethod,
  Receipt,
  StudentInvoices,
  TakePaymentBody,
} from './types'

export const collectFeesService = {
  /** What is still owed for the session named in settings. */
  outstanding: (params: OutstandingParams = {}) =>
    request<Record<string, unknown>>('collect-fees', { query: { ...params } }).then((data) =>
      paginated<Invoice>(data, 'invoices'),
    ),

  paymentMethods: () =>
    request<{ payment_methods: Record<PaymentMethod, string> }>(
      'collect-fees/payment-methods',
    ).then((data) => data.payment_methods),

  /** Admitted pupils matching a name or registration number. */
  findStudents: (params: FindStudentParams) =>
    request<{ students: Student[] }>('collect-fees/students', { query: { ...params } }).then(
      (data) => data.students,
    ),

  /** Current session by default; `all` widens it to every session. */
  studentInvoices: (studentId: Id, all = false) =>
    request<StudentInvoices>(`collect-fees/students/${studentId}/invoices`, {
      query: { all: all ? 1 : undefined },
    }),

  /** The invoice with its full payment history. */
  invoice: (invoiceId: Id) =>
    request<{ invoice: Invoice }>(`collect-fees/${invoiceId}`).then((data) => data.invoice),

  /** Writes money. The transaction and the invoice update land together. */
  pay: (invoiceId: Id, body: TakePaymentBody) =>
    request<{ invoice: Invoice; transaction: Record<string, unknown> }>(
      `collect-fees/${invoiceId}/pay`,
      { method: 'POST', body },
    ),

  /** Only ever issued against a settled transaction; 404 otherwise. */
  receipt: (invoiceId: Id) =>
    request<Receipt>(`collect-fees/${invoiceId}/receipt`),

  report: (params: CollectionsReportParams = {}) =>
    request<CollectionsReport>('collect-fees/reports', { query: { ...params } }),
}
