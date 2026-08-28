import type { CollectionDef, DetailTab } from '@/features/collections/types'
import { CHILDREN, FAMILY_OWING, type Child } from '../children'

const naira = (value: number) => `₦${value.toLocaleString('en-NG')}`

const historyTab: DetailTab[] = [
  {
    label: 'History',
    columns: [
      { key: 'what', label: 'What happened' },
      { key: 'when', label: 'When' },
    ],
    rows: [
      { id: 'h-1', what: 'Opened by you', when: 'Today, 08:31' },
      { id: 'h-2', what: 'Reminder sent by the bursary', when: '17 Nov 2025, 09:00' },
      { id: 'h-3', what: 'Invoice raised', when: '02 Sep 2025, 10:21' },
    ],
  },
]

export const children: CollectionDef = {
  id: 'children',
  path: '/parent/children',
  kicker: 'My children',
  title: 'My children',
  description: 'Both children on your record, with their standing this term.',
  action: 'Add a child',
  actionTo: '/parent/children/add',
  searchHint: 'Search child',
  footer: '2 children · 2025/2026',
  emptyTitle: 'No children linked',
  emptyBody:
    'Link a child to see their results, attendance and fees in one place.',
  noun: 'child',
  nameKey: 'name',
  tabs: historyTab,
  columns: [
    { key: 'name', label: 'Child', cardRole: 'title' },
    { key: 'arm', label: 'Arm', cardRole: 'subtitle' },
    { key: 'adm', label: 'Admission no.' },
    { key: 'avg', label: 'Average', align: 'right' },
    { key: 'attendance', label: 'Attendance', align: 'right' },
    { key: 'fees', label: 'Fees', tag: true, cardRole: 'tag' },
  ],
  rows: CHILDREN.map((child) => ({
    id: child.adm,
    name: child.full,
    arm: child.arm,
    adm: child.adm,
    avg: child.average.toFixed(1),
    attendance: `${child.attendance}%`,
    fees: child.owing > 0 ? 'Owing' : 'Cleared',
  })),
}

export const receipts: CollectionDef = {
  id: 'receipts',
  path: '/parent/receipts',
  kicker: 'Finance',
  title: 'Receipts',
  description:
    'Receipts for every payment that has cleared, across both children.',
  action: 'Download all',
  searchHint: 'Search receipt or child',
  footer: '5 receipts · 2025/2026',
  emptyTitle: 'No receipts yet',
  emptyBody: 'A receipt is issued the moment a payment clears.',
  noun: 'receipt',
  nameKey: 'receipt',
  tabs: historyTab,
  columns: [
    { key: 'receipt', label: 'Receipt', cardRole: 'title' },
    { key: 'child', label: 'Child', cardRole: 'subtitle' },
    { key: 'fee', label: 'Fee' },
    { key: 'amount', label: 'Amount', align: 'right' },
    { key: 'method', label: 'Method' },
    { key: 'date', label: 'Date' },
  ],
  rows: [
    { id: 'RCT-8841', receipt: 'RCT-8841', child: 'Chinedu Udo', fee: 'Tuition — SS', amount: '₦120,000', method: 'Transfer', date: '02 Oct 2025' },
    { id: 'RCT-8802', receipt: 'RCT-8802', child: 'Amaka Udo', fee: 'ICT levy', amount: '₦15,000', method: 'Remita', date: '28 Sep 2025' },
    { id: 'RCT-8790', receipt: 'RCT-8790', child: 'Amaka Udo', fee: 'Tuition — Primary', amount: '₦30,000', method: 'Cash', date: '24 Sep 2025' },
    { id: 'RCT-8744', receipt: 'RCT-8744', child: 'Chinedu Udo', fee: 'ICT levy', amount: '₦15,000', method: 'Remita', date: '19 Sep 2025' },
    { id: 'RCT-8701', receipt: 'RCT-8701', child: 'Chinedu Udo', fee: 'Examination', amount: '₦28,500', method: 'Transfer', date: '17 Sep 2025' },
  ],
}

/** These four lists show one child at a time, so they are built per child. */
export function resultsFor(child: Child): CollectionDef {
  return {
    id: 'results',
    path: '/parent/results',
    scope: child.adm,
    kicker: 'My children',
    title: `Results — ${child.full}`,
    description: `Approved results for the current term. Position is within ${child.arm}.`,
    action: 'Download result sheet',
    searchHint: 'Search subject',
    footer: `${child.results.length} subjects approved · First Term`,
    emptyTitle: 'No results yet',
    emptyBody: 'A subject appears once the bursary approves the batch.',
    noun: 'result',
    nameKey: 'subject',
    tabs: historyTab,
    summary: [
      { label: 'Term average', value: child.average.toFixed(1) },
      { label: 'Position', value: child.position },
      { label: 'Attendance', value: `${child.attendance}%` },
    ],
    columns: [
      { key: 'subject', label: 'Subject', cardRole: 'title' },
      { key: 'ca', label: 'CA', align: 'right' },
      { key: 'exam', label: 'Exam', align: 'right' },
      { key: 'total', label: 'Total', align: 'right', cardRole: 'subtitle' },
      { key: 'grade', label: 'Grade', tag: true, cardRole: 'tag' },
      { key: 'position', label: 'Position', align: 'right' },
    ],
    rows: child.results,
  }
}

export function attendanceFor(child: Child): CollectionDef {
  const watchful = child.attendance > 95
  return {
    id: 'attendance',
    path: '/parent/attendance',
    scope: child.adm,
    kicker: 'My children',
    title: `Attendance — ${child.full}`,
    description:
      'Daily marks as recorded by the form teacher. Raise anything that looks wrong with the office.',
    action: 'Report an absence',
    searchHint: 'Search date or state',
    footer: `Last 6 school days · ${child.attendance}% this term`,
    emptyTitle: 'Nothing marked yet',
    emptyBody: 'Daily marks appear here once the form teacher takes the register.',
    noun: 'mark',
    nameKey: 'date',
    tabs: historyTab,
    summary: [
      { label: 'This term', value: `${child.attendance}%` },
      { label: 'Absences', value: watchful ? '1' : '4' },
      { label: 'Late marks', value: watchful ? '0' : '2' },
    ],
    columns: [
      { key: 'date', label: 'Date', cardRole: 'title' },
      { key: 'day', label: 'Day', cardRole: 'subtitle' },
      { key: 'state', label: 'Mark', tag: true, cardRole: 'tag' },
      { key: 'note', label: 'Note' },
    ],
    rows: child.attendanceRows,
  }
}

export function invoicesFor(child: Child): CollectionDef {
  return {
    id: 'invoices',
    path: '/parent/invoices',
    scope: child.adm,
    kicker: 'Finance',
    title: `Invoices — ${child.full}`,
    description: `Every invoice raised against ${child.name} and what is left to pay.`,
    action: 'Pay an invoice',
    actionTo: '/parent/pay',
    searchHint: 'Search invoice or fee',
    footer: `${child.invoices.length} invoices · 2025/2026`,
    emptyTitle: 'No invoices raised',
    emptyBody: 'Fees raised against this child appear here.',
    noun: 'invoice',
    nameKey: 'invoice',
    tabs: historyTab,
    summary: [
      { label: 'Outstanding', value: naira(child.owing) },
      { label: 'Children owing', value: String(CHILDREN.filter((c) => c.owing > 0).length) },
      { label: 'Family total', value: naira(FAMILY_OWING) },
    ],
    columns: [
      { key: 'invoice', label: 'Invoice', cardRole: 'title' },
      { key: 'fee', label: 'Fee', cardRole: 'subtitle' },
      { key: 'amount', label: 'Amount', align: 'right' },
      { key: 'paid', label: 'Paid', align: 'right' },
      { key: 'balance', label: 'Balance', align: 'right' },
      { key: 'state', label: 'State', tag: true, cardRole: 'tag' },
    ],
    rows: child.invoices,
  }
}

export function testsFor(child: Child): CollectionDef {
  return {
    id: 'tests',
    path: '/parent/tests',
    scope: child.adm,
    kicker: 'Tests',
    title: `Tests for ${child.name}`,
    description: `Computer-based tests set for ${child.name}. You can sit with them while they answer, but the score belongs to them.`,
    action: 'Open the test',
    searchHint: 'Search test',
    footer: `${child.tests.length} tests this term`,
    emptyTitle: 'No tests set',
    emptyBody: 'Tests appear here when a teacher opens one for this arm.',
    noun: 'test',
    nameKey: 'title',
    tabs: historyTab,
    columns: [
      { key: 'title', label: 'Test', cardRole: 'title' },
      { key: 'subject', label: 'Subject', cardRole: 'subtitle' },
      { key: 'closes', label: 'Closes' },
      { key: 'score', label: 'Score', align: 'right' },
      { key: 'state', label: 'State', tag: true, cardRole: 'tag' },
    ],
    rows: child.tests,
  }
}

/** Every parent list for one child, keyed by route id — used to resolve a record. */
export function parentCollections(child: Child) {
  return {
    children,
    receipts,
    results: resultsFor(child),
    attendance: attendanceFor(child),
    invoices: invoicesFor(child),
    tests: testsFor(child),
  }
}
