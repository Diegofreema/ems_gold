import { classArmsService } from '@/api/class-arms/service'
import { studentsService } from '@/api/students/service'
import type { Row } from '@/features/collections/types'
import {
  ADMIT,
  admission,
  type ReviewValues,
} from '@/portals/admin/collections/admission'
import { applicantDocuments } from '@/portals/admin/collections/applicant-row'
import {
  moveOutcome,
  type MoveValues,
  studentMove,
} from '@/portals/admin/collections/student-move'
import { formatNaira, parseNaira } from '@/lib/format'
import type { ActionDef, PickerItem } from './types'

export type AdminFlow = {
  /** Button label on the record, e.g. "Allocate to classes". */
  label: string
  /** The flow needs no record, so the list's primary action opens it. */
  fromList?: boolean
  build: (row?: Row) => ActionDef | Promise<ActionDef>
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

/** The pupil as the picker names them. */
function pupilName(pupil: { fname: string; lname: string; mname?: string | null }) {
  return [pupil.fname, pupil.mname, pupil.lname].filter(Boolean).join(' ')
}

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

async function promote(row?: Row): Promise<ActionDef> {
  const armId = row?.class_arm_id ?? ''
  const from = { departmentId: row?.department_id ?? '' }

  // Everyone in the pupil's own arm, plus anyone admitted into the class but
  // not yet placed — those are exactly the pupils this move can reach.
  const arm = armId
    ? await classArmsService.students(armId).catch(() => undefined)
    : undefined
  const pupils = [...(arm?.students ?? []), ...(arm?.unassigned_in_class ?? [])]
  const names = new Map(pupils.map((pupil) => [pupil.id, pupilName(pupil)]))

  return {
    kicker: 'People · Student register',
    title: 'Promote or transfer pupils',
    description:
      'Pick where these pupils are going. Staying in the class moves them between arms; a different class promotes them. Results and invoices stay attached to the pupil, not the arm.',
    summary: [
      { label: 'From', value: row?.arm ?? DASH },
      { label: 'Class', value: row?.class ?? DASH },
      { label: 'Pupils here', value: String(pupils.length) },
    ],
    picker: {
      title: 'Pupils to move',
      items: pupils.map((pupil) => ({
        key: String(pupil.id),
        label: pupilName(pupil),
        meta: pupil.regno ?? pupil.application_no ?? DASH,
        count: 1,
      })),
      preselected: row?.id ? [row.id] : undefined,
      note: 'Pupils who owe fees can still be moved; the debt follows them.',
      requiredMessage: 'Pick at least one pupil to move.',
    },
    fields: [
      { key: 'department_id', label: 'Move to class', required: true, optionsFrom: 'classes' },
      {
        key: 'class_arm_id',
        label: 'Move to arm',
        required: true,
        optionsFrom: 'arms',
        dependsOn: 'department_id',
        hint: 'The same class means a transfer between arms.',
      },
    ],
    cta: 'Move selected pupils',
    footnote: 'Written to the activity log against your name.',
    done: (picked) => `${picked} ${picked === 1 ? 'pupil moved' : 'pupils moved'}`,
    run: async (values) => {
      const move = studentMove(values as unknown as MoveValues, from)
      const result =
        move.kind === 'transfer'
          ? await classArmsService.assignStudents(move.armId, move.body)
          : await studentsService.promote(move.body).then(() => undefined)

      return moveOutcome(move, result, (id) => names.get(id) ?? `Pupil ${id}`)
    },
  }
}

function review(row?: Row): ActionDef {
  const documents = applicantDocuments(row)
  return {
    kicker: 'People · Applicants',
    title: `Review ${row?.name ?? 'application'}`,
    description:
      'Read the file, then admit into a class arm or decline. An admitted applicant joins the register straight away.',
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
      { key: 'decision', label: 'Decision', required: true, options: [ADMIT, 'Decline'] },
      {
        key: 'department_id',
        label: 'Admit into class',
        optionsFrom: 'classes',
        // Opens on the class the family applied for, which is usually the one.
        value: row?.department_id,
        requiredWhen: { field: 'decision', is: ADMIT },
      },
      {
        key: 'class_arm_id',
        label: 'Admit into arm',
        optionsFrom: 'arms',
        dependsOn: 'department_id',
        requiredWhen: { field: 'decision', is: ADMIT },
        hint: 'Arms belong to a class, so pick the class first.',
      },
    ],
    cta: 'Save decision',
    footnote: 'The applicant appears on the student register once admitted.',
    done: () => 'Decision saved',
    run: async (values) => {
      if (!row) throw new Error('That application could not be loaded.')
      const { body, message } = admission(row, values as ReviewValues)
      await studentsService.update(row.id, body)
      return { message }
    },
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
