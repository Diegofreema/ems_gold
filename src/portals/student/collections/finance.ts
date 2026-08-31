import { pageRows } from '@/features/collections/api'
import type { CollectionDef } from '@/features/collections/types'
import { formatNaira } from '@/lib/format'
import { queryClient } from '@/lib/query-client'
import { studentInvoicesQuery, studentStatsQuery } from '../api/queries'
import { invoiceRows, paidTotal, paymentRows } from '../features/fees/fees'

/**
 * The pupil's fee ledger, from `GET /students/me/invoices` — one answer
 * carrying both the bills and the payments taken against them.
 *
 * Through the cache rather than fetched per panel: the list, the record it
 * opens, the payments tab beside it and all three tiles want the same answer
 * on the same render, and react-query collapses them into one call.
 */
const ledger = () => queryClient.ensureQueryData(studentInvoicesQuery)
const counters = () => queryClient.ensureQueryData(studentStatsQuery)

const rows = () => ledger().then((data) => invoiceRows(data.invoices, data.transactions))

export const invoices: CollectionDef = {
  id: 'invoices',
  path: '/student/invoices',
  kicker: 'Finance',
  title: 'My invoices',
  description:
    'Fees raised against your record and what has been paid. The school lists a bill here once it has been settled — ask the bursary about anything you are still owing.',
  // No button. The design's was "Download receipt", and a pupil login can
  // reach no receipt endpoint; what a receipt would say — the reference, the
  // method, the bursary's own note — is on the record panel instead.
  action: 'Download receipt',
  readonly: true,
  searchHint: 'Search invoice or fee',
  footer: 'Newest first, across every session',
  emptyTitle: 'No invoices raised',
  emptyBody: 'Fees raised against your record appear here once they are settled.',
  noun: 'invoice',
  nameKey: 'invoice',
  counts: [
    {
      label: 'Paid',
      count: () => ledger().then((data) => paidTotal(data.invoices)),
      format: formatNaira,
    },
    {
      label: 'Unpaid',
      count: () => counters().then((data) => data.stats?.invoices_unpaid ?? 0),
    },
    {
      label: 'Raised for you',
      count: () => counters().then((data) => data.stats?.invoices_total ?? 0),
    },
  ],
  columns: [
    { key: 'invoice', label: 'Invoice', cardRole: 'title' },
    { key: 'fee', label: 'Fee', cardRole: 'subtitle' },
    { key: 'amount', label: 'Amount', align: 'right' },
    { key: 'paid', label: 'Paid', align: 'right' },
    { key: 'method', label: 'Method' },
    { key: 'state', label: 'State', tag: true, cardRole: 'tag' },
  ],
  // The panel says more than the table has room for: which session the bill
  // belongs to, when it was raised, and the reference on the payment.
  detail: [
    { key: 'invoice', label: 'Invoice' },
    { key: 'fee', label: 'Fee' },
    { key: 'session', label: 'Session' },
    { key: 'amount', label: 'Amount' },
    { key: 'paid', label: 'Paid' },
    { key: 'state', label: 'State' },
    { key: 'method', label: 'Method' },
    { key: 'payref', label: 'Payment reference' },
    { key: 'raised', label: 'Raised' },
    { key: 'settledOn', label: 'Settled' },
  ],
  tabs: [
    {
      label: 'Payments',
      columns: [
        { key: 'paidOn', label: 'Paid on' },
        { key: 'amount', label: 'Amount', align: 'right' },
        { key: 'method', label: 'Method' },
        { key: 'payref', label: 'Reference' },
        { key: 'note', label: 'Office note' },
      ],
      source: (recordId) => ledger().then((data) => paymentRows(data.transactions, recordId)),
      empty: 'Nothing has been taken against this invoice yet.',
    },
  ],
  source: (params) => rows().then((all) => pageRows(all, params)),
  record: (recordId) => rows().then((all) => all.find((row) => row.id === recordId)),
}
