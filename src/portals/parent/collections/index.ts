import type { CollectionDef } from '@/features/collections/types'
import { formatNaira } from '@/lib/format'
import { familyOwing, type Child } from '../family'

/** "1 invoice", "12 invoices" — a footer is prose, not a column. */
const counted = (amount: number, one: string, many: string) =>
  `${amount} ${amount === 1 ? one : many}`

export function childrenFor(family: Child[]): CollectionDef {
  return {
    id: 'children',
    path: '/parent/children',
    kicker: 'My children',
    title: 'My children',
    description: 'Every child on your record, with what they owe and how they are being marked.',
    action: 'Add a child',
    actionTo: '/parent/children/add',
    searchHint: 'Search child',
    footer: `${counted(family.length, 'child', 'children')} on your record`,
    emptyTitle: 'No children linked',
    emptyBody:
      'Link a child to see their results, attendance and fees in one place.',
    noun: 'child',
    nameKey: 'name',
    // No sub-tables: the API keeps no history a parent may read, and the
    // placeholder in its place would be invented audit entries.
    tabs: [],
    columns: [
      { key: 'name', label: 'Child', cardRole: 'title' },
      { key: 'arm', label: 'Arm', cardRole: 'subtitle' },
      { key: 'adm', label: 'Admission no.' },
      { key: 'owing', label: 'Owing', align: 'right' },
      { key: 'present', label: 'Days present', align: 'right' },
      { key: 'fees', label: 'Fees', tag: true, cardRole: 'tag' },
    ],
    rows: family.map((child) => ({
      id: String(child.id),
      name: child.full,
      arm: child.arm,
      adm: child.adm,
      owing: formatNaira(child.owing),
      present: `${child.present} of ${child.marked}`,
      fees: child.owing > 0 ? 'Owing' : 'Cleared',
    })),
  }
}

/** These lists show one child at a time, so they are built per child. */
export function invoicesFor(child: Child, family: Child[]): CollectionDef {
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
    footer: `${counted(child.invoices.length, 'invoice', 'invoices')}, every session`,
    emptyTitle: 'No invoices raised',
    emptyBody: 'Fees raised against this child appear here.',
    noun: 'invoice',
    nameKey: 'invoice',
    tabs: [],
    summary: [
      { label: 'Outstanding', value: formatNaira(child.owing) },
      {
        label: 'Children owing',
        value: String(family.filter((one) => one.owing > 0).length),
      },
      { label: 'Family total', value: formatNaira(familyOwing(family)) },
    ],
    columns: [
      { key: 'invoice', label: 'Invoice', cardRole: 'title' },
      { key: 'fee', label: 'Fee', cardRole: 'subtitle' },
      { key: 'amount', label: 'Amount', align: 'right' },
      { key: 'paid', label: 'Paid', align: 'right' },
      { key: 'balance', label: 'Balance', align: 'right' },
      { key: 'state', label: 'State', tag: true, cardRole: 'tag' },
    ],
    // The panel says more than the table has room for: which session the bill
    // belongs to, when it was raised, and when it was settled.
    detail: [
      { key: 'invoice', label: 'Invoice' },
      { key: 'fee', label: 'Fee' },
      { key: 'session', label: 'Session' },
      { key: 'amount', label: 'Amount' },
      { key: 'paid', label: 'Paid' },
      { key: 'balance', label: 'Balance' },
      { key: 'state', label: 'State' },
      { key: 'raised', label: 'Raised' },
      { key: 'settledOn', label: 'Settled' },
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
    footer: `${counted(child.tests.length, 'test', 'tests')}`,
    emptyTitle: 'Tests cannot be read yet',
    emptyBody:
      'A paper set for your child is only readable by an account the school has linked to them. Ask the office to link yours.',
    noun: 'test',
    nameKey: 'title',
    tabs: [],
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
export function parentCollections(child: Child, family: Child[]) {
  return {
    children: childrenFor(family),
    invoices: invoicesFor(child, family),
    tests: testsFor(child),
  }
}
