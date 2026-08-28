import type { CollectionDef } from './types'

export const fees: CollectionDef = {
  id: 'fees',
  path: '/admin/fees',
  kicker: 'Finance',
  title: 'Fee catalogue',
  description:
    'Every chargeable fee, its amount and the classes it is allocated to. Amounts here drive every invoice raised this term.',
  action: 'Create fee',
  searchHint: 'Search fee name',
  footer: 'Showing 6 of 6 fees · First Term 2025/2026',
  emptyTitle: 'No fees in the catalogue',
  emptyBody:
    'Nothing can be invoiced until at least one fee exists. Create the first one and allocate it to classes.',
  noun: 'fee',
  nameKey: 'name',
  summary: [
    { label: 'Active fees', value: '6' },
    { label: 'Total per pupil (SS1)', value: '₦182,500' },
    { label: 'Unallocated fees', value: '1' },
  ],
  columns: [
    { key: 'name', label: 'Fee', cardRole: 'title' },
    { key: 'type', label: 'Type', cardRole: 'subtitle' },
    { key: 'amount', label: 'Amount', align: 'right' },
    { key: 'classes', label: 'Allocated to' },
    { key: 'status', label: 'Status', tag: true, cardRole: 'tag' },
  ],
  rows: [
    { id: 'fee-1', name: 'Tuition — Senior Secondary', type: 'Termly', amount: '₦120,000', classes: 'SS1 – SS3', status: 'Active' },
    { id: 'fee-2', name: 'Tuition — Junior Secondary', type: 'Termly', amount: '₦95,000', classes: 'JSS1 – JSS3', status: 'Active' },
    { id: 'fee-3', name: 'Tuition — Primary', type: 'Termly', amount: '₦62,000', classes: 'Primary 1 – 6', status: 'Active' },
    { id: 'fee-4', name: 'Boarding', type: 'Termly', amount: '₦85,000', classes: '9 arms', status: 'Active' },
    { id: 'fee-5', name: 'Examination (WAEC)', type: 'One-off', amount: '₦28,500', classes: 'SS3', status: 'Active' },
    { id: 'fee-6', name: 'ICT levy', type: 'Session', amount: '₦15,000', classes: 'Not allocated', status: 'Draft' },
  ],
  form: [
    {
      title: 'The fee',
      fields: [
        { key: 'name', label: 'Fee name', required: true, wide: true, placeholder: 'Tuition — Senior Secondary', hint: 'Appears on the invoice exactly as written.' },
        { key: 'type', label: 'Charged', required: true, options: ['Termly', 'Session', 'One-off'] },
        { key: 'amount', label: 'Amount (₦)', required: true, numeric: true, placeholder: '120,000' },
      ],
    },
    {
      title: 'Where it applies',
      fields: [
        { key: 'classes', label: 'Allocated to', options: ['Not allocated', 'Primary 1 – 6', 'JSS1 – JSS3', 'SS1 – SS3', 'All classes'], hint: 'You can allocate to individual arms after saving.' },
        { key: 'status', label: 'Status', options: ['Draft', 'Active'] },
        { key: 'note', label: 'Internal note', multiline: true, wide: true, placeholder: 'Why this fee exists, who approved it.' },
      ],
    },
  ],
}

export const collect: CollectionDef = {
  id: 'collect',
  path: '/admin/collect',
  kicker: 'Finance',
  title: 'Fee collection',
  description:
    'Outstanding invoices waiting on payment. Record cash, transfer or POS against an invoice and the receipt is issued immediately.',
  action: 'Take a payment',
  searchHint: 'Search pupil or invoice no.',
  footer: '20 of 214 outstanding invoices',
  emptyTitle: 'Nothing outstanding',
  emptyBody:
    'Every invoice for this term has been settled. New invoices will appear here as they fall due.',
  noun: 'invoice',
  nameKey: 'student',
  summary: [
    { label: 'Outstanding', value: '₦12,480,000' },
    { label: 'Collected today', value: '₦1,930,000' },
    { label: 'Invoices overdue', value: '214' },
  ],
  columns: [
    { key: 'invoice', label: 'Invoice', cardRole: 'subtitle' },
    { key: 'student', label: 'Pupil', cardRole: 'title' },
    { key: 'arm', label: 'Arm' },
    { key: 'balance', label: 'Balance', align: 'right' },
    { key: 'due', label: 'Due' },
    { key: 'status', label: 'Status', tag: true, cardRole: 'tag' },
  ],
  rows: [
    { id: 'c-1', invoice: 'INV-25091', student: 'Chinedu Udo', arm: 'SS2 B', balance: '₦85,000', due: '12 Oct 2025', status: 'Overdue' },
    { id: 'c-2', invoice: 'INV-25104', student: 'Fatima Bello', arm: 'JSS1 A', balance: '₦47,500', due: '19 Oct 2025', status: 'Overdue' },
    { id: 'c-3', invoice: 'INV-25117', student: 'Tolu Adeyemi', arm: 'Primary 4 A', balance: '₦31,000', due: '02 Nov 2025', status: 'Part paid' },
    { id: 'c-4', invoice: 'INV-25133', student: 'Ngozi Eze', arm: 'SS1 A', balance: '₦120,000', due: '05 Nov 2025', status: 'Unpaid' },
    { id: 'c-5', invoice: 'INV-25148', student: 'Ibrahim Sani', arm: 'JSS3 C', balance: '₦95,000', due: '05 Nov 2025', status: 'Unpaid' },
    { id: 'c-6', invoice: 'INV-25156', student: 'Amarachi Nwosu', arm: 'Primary 6 B', balance: '₦18,750', due: '11 Nov 2025', status: 'Part paid' },
    { id: 'c-7', invoice: 'INV-25161', student: 'David Ogunleye', arm: 'SS3 A', balance: '₦28,500', due: '14 Nov 2025', status: 'Unpaid' },
  ],
}

export const invoices: CollectionDef = {
  id: 'invoices',
  path: '/admin/invoices',
  kicker: 'Finance',
  title: 'Invoices',
  description:
    'Every invoice raised this session, paid or not. Open one to see its payment history and reissue the receipt.',
  action: 'Create invoice',
  searchHint: 'Search invoice or pupil',
  footer: '8 of 1,604 invoices · 2025/2026',
  emptyTitle: 'No invoices yet',
  emptyBody:
    'Invoices appear here once fees are allocated to a class and raised against pupils.',
  noun: 'invoice',
  nameKey: 'student',
  columns: [
    { key: 'invoice', label: 'Invoice', cardRole: 'subtitle' },
    { key: 'student', label: 'Pupil', cardRole: 'title' },
    { key: 'fee', label: 'Fee' },
    { key: 'amount', label: 'Amount', align: 'right' },
    { key: 'paid', label: 'Paid', align: 'right' },
    { key: 'status', label: 'Status', tag: true, cardRole: 'tag' },
  ],
  rows: [
    { id: 'i-1', invoice: 'INV-25091', student: 'Chinedu Udo', fee: 'Boarding', amount: '₦85,000', paid: '₦0', status: 'Overdue' },
    { id: 'i-2', invoice: 'INV-25088', student: 'Halima Yusuf', fee: 'Tuition — JSS', amount: '₦95,000', paid: '₦95,000', status: 'Paid' },
    { id: 'i-3', invoice: 'INV-25084', student: 'Segun Bakare', fee: 'Tuition — SS', amount: '₦120,000', paid: '₦120,000', status: 'Paid' },
    { id: 'i-4', invoice: 'INV-25117', student: 'Tolu Adeyemi', fee: 'Tuition — Primary', amount: '₦62,000', paid: '₦31,000', status: 'Part paid' },
    { id: 'i-5', invoice: 'INV-25074', student: 'Blessing Okoro', fee: 'ICT levy', amount: '₦15,000', paid: '₦15,000', status: 'Paid' },
    { id: 'i-6', invoice: 'INV-25133', student: 'Ngozi Eze', fee: 'Tuition — SS', amount: '₦120,000', paid: '₦0', status: 'Unpaid' },
    { id: 'i-7', invoice: 'INV-25061', student: 'Emeka Obi', fee: 'Examination (WAEC)', amount: '₦28,500', paid: '₦28,500', status: 'Paid' },
    { id: 'i-8', invoice: 'INV-25156', student: 'Amarachi Nwosu', fee: 'Boarding', amount: '₦85,000', paid: '₦66,250', status: 'Part paid' },
  ],
  form: [
    {
      title: 'Invoice',
      fields: [
        { key: 'student', label: 'Pupil', required: true, wide: true, placeholder: 'Search by name or admission number' },
        { key: 'fee', label: 'Fee', required: true, options: ['Tuition — SS', 'Tuition — JSS', 'Tuition — Primary', 'Boarding', 'Examination (WAEC)', 'ICT levy'] },
        { key: 'amount', label: 'Amount (₦)', required: true, numeric: true, placeholder: '120,000' },
        { key: 'due', label: 'Due date', required: true, date: true },
        { key: 'status', label: 'Status', options: ['Unpaid', 'Part paid', 'Paid'] },
      ],
    },
  ],
}

export const spendings: CollectionDef = {
  id: 'spendings',
  path: '/admin/spendings',
  kicker: 'Finance',
  title: 'Spendings',
  description:
    'The expenditure ledger. Every entry is dated, categorised and attributable to the staff member who recorded it.',
  action: 'Record a spending',
  searchHint: 'Search description',
  footer: '7 entries · November 2025',
  emptyTitle: 'No spendings recorded',
  emptyBody: 'The expenditure ledger is empty for this period.',
  noun: 'spending',
  nameKey: 'description',
  summary: [
    { label: 'Spent this month', value: '₦4,182,000' },
    { label: 'Largest category', value: 'Salaries' },
    { label: 'Entries', value: '7' },
  ],
  columns: [
    { key: 'date', label: 'Date', cardRole: 'subtitle' },
    { key: 'description', label: 'Description', cardRole: 'title' },
    { key: 'category', label: 'Category' },
    { key: 'amount', label: 'Amount', align: 'right' },
    { key: 'by', label: 'Recorded by' },
  ],
  rows: [
    { id: 's-1', date: '18 Nov', description: 'November salaries — teaching staff', category: 'Salaries', amount: '₦3,100,000', by: 'A. Okonkwo' },
    { id: 's-2', date: '16 Nov', description: 'Diesel — 2,000 litres', category: 'Utilities', amount: '₦412,000', by: 'S. Idowu' },
    { id: 's-3', date: '14 Nov', description: 'Science laboratory reagents', category: 'Academics', amount: '₦186,500', by: 'A. Okonkwo' },
    { id: 's-4', date: '11 Nov', description: 'Bus maintenance — Hiace 2', category: 'Transport', amount: '₦154,000', by: 'S. Idowu' },
    { id: 's-5', date: '08 Nov', description: 'Printing — mid-term test papers', category: 'Academics', amount: '₦88,000', by: 'C. Nnaji' },
    { id: 's-6', date: '05 Nov', description: 'Cleaning supplies', category: 'Operations', amount: '₦42,500', by: 'S. Idowu' },
    { id: 's-7', date: '02 Nov', description: 'Internet subscription', category: 'Utilities', amount: '₦199,000', by: 'A. Okonkwo' },
  ],
  form: [
    {
      title: 'Spending',
      fields: [
        { key: 'description', label: 'What was it for', required: true, wide: true, placeholder: 'Diesel — 2,000 litres' },
        { key: 'amount', label: 'Amount (₦)', required: true, numeric: true, placeholder: '412,000' },
        { key: 'category', label: 'Category', required: true, options: ['Salaries', 'Utilities', 'Academics', 'Transport', 'Operations'] },
        { key: 'date', label: 'Date', required: true, date: true },
        { key: 'by', label: 'Recorded by', options: ['A. Okonkwo', 'S. Idowu', 'C. Nnaji'] },
      ],
    },
  ],
}
