import type { Row } from '@/features/collections/types'
import { formatNaira, parseNaira } from '@/lib/format'
import type { ActionDef, PickerItem } from './types'

export type AdminFlow = {
  /** Button label on the record, e.g. "Allocate to classes". */
  label: string
  /** The flow needs no record, so the list's primary action opens it. */
  fromList?: boolean
  build: (row?: Row) => ActionDef
}

/** Every arm a fee can be allocated to, with the pupils it holds. */
const ARMS: PickerItem[] = [
  ['Primary 1 A', 38],
  ['Primary 4 A', 41],
  ['Primary 6 B', 36],
  ['JSS1 A', 44],
  ['JSS3 C', 39],
  ['SS1 A', 35],
  ['SS2 B', 34],
  ['SS3 A', 31],
].map(([label, count]) => ({
  key: label as string,
  label: label as string,
  meta: `${count} pupils`,
  count: count as number,
}))

const DASH = '—'

function allocate(row?: Row): ActionDef {
  const amount = parseNaira(row?.amount ?? '')
  return {
    kicker: 'Finance · Fee catalogue',
    title: `Allocate ${row?.name ?? 'this fee'}`,
    description:
      'Pick the arms this fee applies to. Invoices are raised for every pupil in the arms you pick, at the amount on the fee.',
    summary: [
      { label: 'Fee', value: row?.name ?? DASH },
      { label: 'Per pupil', value: formatNaira(amount) },
      { label: 'Charged', value: row?.type ?? DASH },
    ],
    picker: {
      title: 'Class arms',
      items: ARMS,
      note: 'Pupils admitted later are billed automatically while the fee stays active.',
      requiredMessage: 'Pick at least one arm to bill.',
    },
    fields: [
      { key: 'due', label: 'Due date', required: true, date: true, value: new Date(2025, 10, 30) },
      { key: 'notify', label: 'Tell parents', required: true, options: ['Email and SMS', 'Email only', 'Do not notify'] },
    ],
    unitAmount: amount,
    cta: 'Raise invoices',
    footnote: 'Nothing is billed until you press this.',
    confirm: (total) => ({
      title: 'Raise these invoices?',
      body: 'Every pupil in the arms you picked is billed at the fee amount, and their parents see the invoice straight away. Invoices already raised are not touched.',
      subject: `${total.pupils} ${total.pupils === 1 ? 'pupil' : 'pupils'} · ${formatNaira(total.amount)} · ${row?.name ?? 'this fee'}`,
      cta: 'Raise invoices',
      cancel: 'Go back',
    }),
    done: (picked) => `Invoices raised for ${picked} ${picked === 1 ? 'arm' : 'arms'}`,
  }
}

function payment(row?: Row): ActionDef {
  // Opened from the collection page there is no invoice yet, so the flow asks
  // for one; opened from an invoice it already knows what is being settled.
  const balance = parseNaira(row?.balance ?? row?.owing ?? row?.amount ?? '')
  const lookup: ActionDef['fields'] = row
    ? []
    : [
        {
          key: 'pupil',
          label: 'Pupil',
          required: true,
          wide: true,
          hint: 'Search by name or admission number.',
          options: [
            'Chinedu Udo — SS2 B',
            'Fatima Bello — JSS1 A',
            'Tolu Adeyemi — Primary 4 A',
            'Ngozi Eze — SS1 A',
            'Ibrahim Sani — JSS3 C',
          ],
        },
        {
          key: 'invoice',
          label: 'Invoice to settle',
          required: true,
          wide: true,
          options: [
            'INV-25091 — Boarding — ₦85,000 outstanding',
            'INV-25104 — Tuition JSS — ₦47,500 outstanding',
            'INV-25117 — Tuition Primary — ₦31,000 outstanding',
          ],
        },
      ]

  return {
    kicker: 'Finance · Fee collection',
    title: 'Take a payment',
    description: row
      ? 'Record money received at the bursary. The receipt is issued immediately and the parent is notified.'
      : 'Find the pupil, pick the invoice being settled, then record what you received. The receipt is issued immediately.',
    // The flow is reached from an invoice and from a parent account, and the
    // two identify themselves differently.
    summary: row
      ? [
          ...(row.student
            ? [
                { label: 'Invoice', value: row.invoice ?? DASH },
                { label: 'Pupil', value: row.student },
              ]
            : [
                { label: 'Parent', value: row.name ?? DASH },
                { label: 'Children', value: row.children ?? DASH },
              ]),
          { label: 'Balance', value: formatNaira(balance) },
        ]
      : [],
    fields: [
      ...lookup,
      {
        key: 'amount',
        label: 'Amount received (₦)',
        required: true,
        numeric: true,
        value: balance ? balance.toLocaleString('en-NG') : '',
      },
      { key: 'method', label: 'Method', required: true, options: ['Cash', 'Bank transfer', 'POS', 'Remita (RRR)'] },
      {
        key: 'ref',
        label: 'Reference or teller number',
        wide: true,
        hint: 'Leave empty for cash taken at the counter.',
      },
    ],
    cta: 'Record payment and issue receipt',
    footnote: 'Part payments are allowed.',
    done: () => 'Payment recorded — receipt issued',
  }
}

function promote(row?: Row): ActionDef {
  return {
    kicker: 'People · Student register',
    title: 'Promote or transfer pupils',
    description:
      'Move pupils from one arm to another. Results and invoices stay attached to the pupil, not the arm.',
    summary: [
      { label: 'From', value: row?.arm ?? 'SS2 B' },
      { label: 'Pupils in arm', value: '34' },
      { label: 'Session', value: '2025/2026' },
    ],
    picker: {
      title: 'Pupils to move',
      items: [
        ['Chinedu Udo', 'Owing ₦85,000'],
        ['Halima Yusuf', 'Cleared'],
        ['Segun Bakare', 'Cleared'],
        ['Zainab Lawal', 'Cleared'],
        ['Samuel Idris', 'Owing ₦42,000'],
        ['Amarachi Nwosu', 'Part paid'],
      ].map(([label, meta]) => ({ key: label, label, meta, count: 1 })),
      note: 'Pupils who owe fees can still be promoted; the debt follows them.',
      requiredMessage: 'Pick at least one pupil to move.',
    },
    fields: [
      { key: 'target', label: 'Move to', required: true, options: ['SS3 A', 'SS3 B', 'SS2 B (no change)', 'Graduated'] },
      { key: 'effective', label: 'Effective from', required: true, value: 'Second Term 2025/2026' },
    ],
    cta: 'Move selected pupils',
    footnote: 'Written to the activity log against your name.',
    done: (picked) => `${picked} ${picked === 1 ? 'pupil moved' : 'pupils moved'}`,
  }
}

function review(row?: Row): ActionDef {
  const documents: PickerItem[] = [
    { key: 'birth', label: 'Birth certificate', meta: 'PDF · 1.2 MB', count: 1 },
    { key: 'report', label: 'Last school report', meta: 'PDF · 840 KB', count: 1 },
    { key: 'transfer', label: 'Transfer certificate', meta: 'Not supplied', count: 0 },
    { key: 'photo', label: 'Passport photograph', meta: 'JPG · 310 KB', count: 1 },
  ]
  return {
    kicker: 'People · Applicants',
    title: `Review ${row?.name ?? 'application'}`,
    description:
      'Read the file, then admit into an arm or decline. The family is emailed either way.',
    summary: [
      { label: 'Reference', value: row?.ref ?? DASH },
      { label: 'Applying to', value: row?.applying ?? DASH },
      { label: 'Submitted', value: row?.submitted ?? DASH },
    ],
    picker: {
      title: 'Documents on file',
      items: documents,
      // A document that was never supplied cannot have been seen.
      preselected: documents.filter((item) => item.count > 0).map((item) => item.key),
      note: 'Tick the documents you have seen and verified.',
    },
    fields: [
      { key: 'decision', label: 'Decision', required: true, options: ['Admit', 'Invite for interview', 'Decline'] },
      { key: 'arm', label: 'Admit into', required: true, options: ['JSS1 A', 'JSS1 B', 'Primary 1 A', 'SS1 A'] },
      {
        key: 'note',
        label: 'Note to the family',
        wide: true,
        hint: 'Included in the email. Keep it short and plain.',
      },
    ],
    cta: 'Save decision and email the family',
    footnote: 'The applicant appears on the student register once admitted.',
    done: () => 'Decision saved — the family has been emailed',
  }
}

function lend(row?: Row): ActionDef {
  return {
    kicker: 'School · Library',
    title: `Issue ${row?.title ?? 'book'}`,
    description:
      'Lend a copy to a pupil. Two weeks is the standard loan; overdue copies show on the library page.',
    summary: [
      { label: 'Title', value: row?.title ?? DASH },
      { label: 'Copies held', value: row?.copies ?? DASH },
      { label: 'On loan', value: row?.out ?? DASH },
    ],
    fields: [
      {
        key: 'pupil',
        label: 'Pupil',
        required: true,
        wide: true,
        hint: 'Search by name or admission number.',
        placeholder: 'Chinedu Udo — NEB/2021/0412',
      },
      { key: 'due', label: 'Due back', required: true, date: true, value: new Date(2025, 11, 3) },
      { key: 'copies', label: 'Copies', required: true, options: ['1', '2', '3'] },
    ],
    cta: 'Issue book',
    footnote: 'Record the return from the same page when it comes back.',
    done: () => 'Book issued',
  }
}

/**
 * Which flow each collection's records enter, keyed by collection id. This is
 * the only place a flow is declared: a collection that is not listed here has
 * no flow and shows no button, so a filtered view of another collection's rows
 * cannot inherit one it has no page for.
 */
export const adminFlows: Record<string, AdminFlow> = {
  fees: { label: 'Allocate to classes', build: allocate },
  collect: { label: 'Take a payment', fromList: true, build: payment },
  invoices: { label: 'Record offline payment', build: payment },
  parents: { label: 'Take a payment', build: payment },
  students: { label: 'Promote or transfer', build: promote },
  applicants: { label: 'Review application', build: review },
  library: { label: 'Issue this book', build: lend },
}
