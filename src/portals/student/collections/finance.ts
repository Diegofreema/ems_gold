import type { CollectionDef } from '@/features/collections/types'
import { historyTab } from './history'

export const invoices: CollectionDef = {
  id: 'invoices',
  path: '/student/invoices',
  kicker: 'Finance',
  title: 'My invoices',
  description:
    'Fees raised against your record and what has been paid. Receipts are issued the moment a payment clears.',
  action: 'Download receipt',
  searchHint: 'Search invoice or fee',
  footer: '5 invoices · 2025/2026',
  emptyTitle: 'No invoices raised',
  emptyBody: 'Fees raised against your record appear here.',
  noun: 'invoice',
  nameKey: 'invoice',
  tabs: historyTab,
  summary: [
    { label: 'Billed this term', value: '₦135,000' },
    { label: 'Paid', value: '₦135,000' },
    { label: 'Outstanding', value: '₦0' },
  ],
  columns: [
    { key: 'invoice', label: 'Invoice', cardRole: 'title' },
    { key: 'fee', label: 'Fee', cardRole: 'subtitle' },
    { key: 'amount', label: 'Amount', align: 'right' },
    { key: 'paid', label: 'Paid', align: 'right' },
    { key: 'method', label: 'Method' },
    { key: 'state', label: 'State', tag: true, cardRole: 'tag' },
  ],
  rows: [
    { id: 'i-1', invoice: 'INV-25133', fee: 'Tuition — SS', amount: '₦120,000', paid: '₦120,000', method: 'Transfer', state: 'Paid' },
    { id: 'i-2', invoice: 'INV-25074', fee: 'ICT levy', amount: '₦15,000', paid: '₦15,000', method: 'Remita', state: 'Paid' },
    { id: 'i-3', invoice: 'INV-24980', fee: 'Tuition — SS', amount: '₦120,000', paid: '₦120,000', method: 'Transfer', state: 'Paid' },
    { id: 'i-4', invoice: 'INV-24902', fee: 'Boarding', amount: '₦85,000', paid: '₦85,000', method: 'Cash', state: 'Paid' },
    { id: 'i-5', invoice: 'INV-24871', fee: 'Examination', amount: '₦28,500', paid: '₦28,500', method: 'Remita', state: 'Paid' },
  ],
}

export const record: CollectionDef = {
  id: 'record',
  path: '/student/record',
  kicker: 'Finance',
  title: 'My record',
  description:
    'What the school holds about you. Ask the office to correct anything wrong here.',
  action: 'Request a change',
  searchHint: 'Search field',
  footer: 'Last updated 12 September 2025',
  emptyTitle: 'Nothing on file',
  emptyBody: 'The office has not filled in your record yet.',
  noun: 'field',
  nameKey: 'field',
  tabs: historyTab,
  columns: [
    { key: 'field', label: 'Field', cardRole: 'title' },
    { key: 'value', label: 'Value', cardRole: 'subtitle' },
  ],
  rows: [
    { id: 'rc-1', field: 'Full name', value: 'Amara Chiamaka Okeke' },
    { id: 'rc-2', field: 'Admission number', value: 'NEB/2022/0871' },
    { id: 'rc-3', field: 'Class arm', value: 'SS1 A' },
    { id: 'rc-4', field: 'Date of birth', value: '14 March 2010' },
    { id: 'rc-5', field: 'Parent / guardian', value: 'Mr & Mrs Okeke' },
    { id: 'rc-6', field: 'Parent phone', value: '0705 883 1190' },
    { id: 'rc-7', field: 'Address', value: '14 Ogui Road, Enugu' },
    { id: 'rc-8', field: 'Boarding status', value: 'Day' },
  ],
}
