import { classArmsService } from '@/api/class-arms/service'
import { collectFeesService } from '@/api/collect-fees/service'
import { departmentsService } from '@/api/departments/service'
import { feesService } from '@/api/fees/service'
import { studentsService } from '@/api/students/service'
import { subjectsService } from '@/api/subjects/service'
import type { Row } from '@/features/collections/types'
import {
  ADMIT,
  admission,
  type ReviewValues,
} from '@/portals/admin/collections/admission'
import { applicantDocuments } from '@/portals/admin/collections/applicant-row'
import { collecting, figure, payAction, paymentBody } from '@/portals/admin/collections/collect-row'
import {
  moveOutcome,
  type MoveValues,
  studentMove,
} from '@/portals/admin/collections/student-move'
import { formatNaira, parseNaira } from '@/lib/format'
import type { ActionDef } from './types'

export type AdminFlow = {
  /** Button label on the record, e.g. "Allocate to classes". */
  label: string
  /** The flow needs no record, so the list's primary action opens it. */
  fromList?: boolean
  /** Records the flow can run against; offered on every record without it. */
  when?: (record: Row) => boolean
  build: (row?: Row) => ActionDef | Promise<ActionDef>
}

/** Everything on one page — a school has classes in the dozens. */
const ALL_CLASSES = 200

const DASH = '—'

/** The pupil as the picker names them. */
function pupilName(pupil: { fname: string; lname: string; mname?: string | null }) {
  return [pupil.fname, pupil.mname, pupil.lname].filter(Boolean).join(' ')
}

/**
 * Allocating a fee to classes.
 *
 * The design picks class arms; `POST /fees/{id}/allocate` takes classes and
 * levels, and knows nothing about arms — so the picker offers classes. Each
 * one is asked how many pupils it holds, because the whole point of this
 * screen is seeing what pressing the button will bill.
 *
 * Passing `departments` replaces the whole set, so the classes a fee is
 * already charged to arrive ticked: unticking one is how it is unallocated.
 */
async function allocate(row?: Row): Promise<ActionDef> {
  const amount = parseNaira(row?.amount ?? '')
  const classes = await departmentsService
    .list({ limit: ALL_CLASSES })
    .then((page) => page.items)
    .catch(() => [])

  const headcounts = await Promise.all(
    classes.map((department) =>
      studentsService
        .list({ department_id: department.id, status: 'Admitted', limit: 1 })
        .then((page) => page.pagination.total)
        .catch(() => 0),
    ),
  )

  return {
    kicker: 'Finance · Fee catalogue',
    title: `Allocate ${row?.name ?? 'this fee'}`,
    description:
      'Pick the classes this fee applies to. Invoices are raised for every pupil in them, at the amount on the fee.',
    summary: [
      { label: 'Fee', value: row?.name ?? DASH },
      { label: 'Per pupil', value: formatNaira(amount) },
      { label: 'Charged to', value: row?.charge ?? DASH },
    ],
    picker: {
      title: 'Classes',
      items: classes.map((department, index) => ({
        key: String(department.id),
        label: department.name,
        meta: `${headcounts[index]} ${headcounts[index] === 1 ? 'pupil' : 'pupils'}`,
        count: headcounts[index],
      })),
      // Unticking is how a class is dropped, so what it is already charged to
      // has to be on screen before anything is changed.
      preselected: row?.classIds ? row.classIds.split(',').filter(Boolean) : undefined,
      note: 'Unticking a class stops the fee applying to it. Invoices already raised are not touched.',
      requiredMessage: 'Pick at least one class to bill.',
    },
    fields: [],
    unitAmount: amount,
    cta: 'Allocate to these classes',
    footnote: 'Nothing is billed until you press this.',
    confirm: (total = { pupils: 0, amount: 0 }) => ({
      title: 'Allocate this fee?',
      body: 'Every pupil in the classes ticked is billed at the fee amount. Classes you unticked stop being charged, and invoices already raised are not touched.',
      subject: `${total.pupils} ${total.pupils === 1 ? 'pupil' : 'pupils'} · ${formatNaira(total.amount)} · ${row?.name ?? 'this fee'}`,
      cta: 'Allocate the fee',
      cancel: 'Go back',
    }),
    run: async (values) => {
      const picked = (values.picks as string[] | undefined) ?? []
      await feesService.allocate(String(row?.id ?? ''), {
        departments: picked.map(Number),
      })
      return {
        message: `${row?.name ?? 'The fee'} allocated to ${picked.length} ${picked.length === 1 ? 'class' : 'classes'}`,
      }
    },
    done: (picked) => `Fee allocated to ${picked} ${picked === 1 ? 'class' : 'classes'}`,
  }
}

/**
 * Taking a payment at the counter.
 *
 * `POST /collect-fees/{id}/pay` settles the invoice with no gateway involved,
 * and it insists that `amount + discount` equal the invoice exactly — there is
 * no part payment. So the flow does not ask what was collected: it asks what
 * was waived, and derives the rest. A clerk who could type both could type a
 * pair that does not add up, and would learn that from a 4xx.
 *
 * It always starts from an invoice, because the queue behind it searches by
 * pupil name and registration number: finding the bill is the search, and
 * looking at it before touching money is the point of the screen.
 */
function payment(row?: Row): ActionDef {
  const total = figure(row?.total)

  return {
    kicker: 'Finance · Fee collection',
    title: 'Take a payment',
    description:
      'Record money collected over the counter. The invoice is settled in full, less any discount granted — there is no part payment and no undoing it from here.',
    summary: [
      { label: 'Pupil', value: row?.student ?? DASH },
      { label: 'Reg. no.', value: row?.regno ?? DASH },
      { label: 'Fee', value: row?.fee ?? DASH },
      { label: 'Invoice', value: formatNaira(total) },
    ],
    fields: [
      {
        key: 'payment_method',
        label: 'How it was paid',
        required: true,
        optionsFrom: 'payment-methods',
        hint: 'The school\'s own list, not a fixed one.',
      },
      {
        key: 'discount',
        label: 'Discount granted (₦)',
        money: true,
        placeholder: '0',
        hint: 'Leave empty to collect the invoice in full.',
      },
      {
        key: 'notes',
        label: 'Note',
        wide: true,
        multiline: true,
        placeholder: 'Transfer ref 99881',
        hint: 'The teller number or transfer reference. Kept on the payment.',
      },
    ],
    // What the clerk will actually take, recomputed as the discount is typed.
    tally: (values) => {
      const { amount, discount } = collecting(total, values.discount)
      return [
        { label: 'Discount', value: formatNaira(discount) },
        { label: 'To collect', value: formatNaira(amount) },
      ]
    },
    cta: 'Record payment',
    footnote: 'Nothing is collected until you press this.',
    confirm: (_total, values) => {
      const { amount, discount } = collecting(total, values?.discount)
      return {
        title: 'Record this payment?',
        body: 'This settles the invoice outright and writes the transaction against your name. There is no undoing it from here.',
        // The pupil, the fee and the figure — the three things a counter
        // checks before the money is committed to the wrong bill.
        subject: [
          row?.student,
          row?.fee,
          formatNaira(amount),
          discount ? `less ${formatNaira(discount)}` : undefined,
        ]
          .filter(Boolean)
          .join(' · '),
        cta: 'Record the payment',
        cancel: 'Go back',
      }
    },
    run: async (values) => {
      const body = paymentBody(total, values)
      const { transaction } = await collectFeesService.pay(String(row?.id ?? ''), body)
      // The API mints the reference, and it is what a parent quotes back when
      // they query the payment, so the toast hands it over rather than the
      // fixed "Payment recorded" a `meta` would give.
      return { message: `Payment recorded — ${transaction.payref}` }
    },
    done: () => 'Payment recorded',
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
/**
 * Placing pupils into an arm.
 *
 * `POST /class-arms/{id}/students` judges each pupil separately and reports
 * what it would not take, so a partial move is a real outcome rather than a
 * failure — the page holds open with the reasons rather than navigating away.
 *
 * The picker offers only `unassigned_in_class`: pupils admitted into this
 * arm's class who are not yet in any arm. A pupil already placed elsewhere is
 * moved from the promote flow, not from here.
 */
async function placePupils(row?: Row): Promise<ActionDef> {
  const armId = String(row?.id ?? '')
  const { unassigned_in_class } = await classArmsService.students(armId)

  return {
    kicker: 'Academics · Class arms',
    title: `Place pupils in ${row?.arm ?? 'this arm'}`,
    description:
      'Pick the pupils to put on this arm’s roll. Only pupils admitted into its class and not yet in any arm are listed.',
    summary: [
      { label: 'Arm', value: row?.arm ?? DASH },
      { label: 'Class', value: row?.klass ?? DASH },
      { label: 'On the roll', value: row?.roll ?? DASH },
    ],
    picker: {
      title: 'Waiting to be placed',
      items: unassigned_in_class.map((pupil) => ({
        key: String(pupil.id),
        label: pupilName(pupil),
        meta: pupil.regno || 'No adm. no. yet',
        count: 1,
      })),
      note:
        unassigned_in_class.length === 0
          ? 'Every pupil admitted into this class is already in an arm.'
          : 'A pupil may only join an arm of their own class. Placing them here puts this arm on their register, their result sheet and their attendance.',
      requiredMessage: 'Pick at least one pupil to place.',
    },
    fields: [],
    cta: 'Place these pupils',
    footnote: 'Nothing moves until you press this.',
    run: async (values) => {
      const picked = (values.picks as string[] | undefined) ?? []
      const { assigned, failed } = await classArmsService.assignStudents(armId, {
        student_ids: picked.map(Number),
      })
      return {
        message: `${assigned.length} ${assigned.length === 1 ? 'pupil' : 'pupils'} placed in ${row?.arm ?? 'the arm'}`,
        failures: failed.map((one) => {
          const pupil = unassigned_in_class.find((each) => each.id === one.student_id)
          return `${pupil ? pupilName(pupil) : `Pupil ${one.student_id}`} — ${one.reason}`
        }),
      }
    },
    done: (picked) => `${picked} ${picked === 1 ? 'pupil' : 'pupils'} placed in the arm`,
  }
}

/**
 * Choosing the classes a subject is taught to.
 *
 * `POST /subjects/{id}/classes` replaces the whole set, so the classes it is
 * already taught to arrive ticked and unticking one is how it is dropped. The
 * home class is kept by the API whether it is listed or not, which is what
 * stops a subject ending up taught to nobody — it is shown ticked and said so.
 */
async function teachTo(row?: Row): Promise<ActionDef> {
  const homeId = String(row?.department_id ?? '')
  const classes = await departmentsService
    .list({ limit: ALL_CLASSES })
    .then((page) => page.items)

  return {
    kicker: 'Academics · Subjects',
    title: `Teach ${row?.name ?? 'this subject'} to`,
    description:
      'Pick every class this subject is taught to. Unticking one drops it; the home class is always kept.',
    summary: [
      { label: 'Subject', value: row?.name ?? DASH },
      { label: 'Home class', value: row?.klass ?? DASH },
      { label: 'Taught to', value: row?.taught ?? DASH },
    ],
    picker: {
      title: 'Classes',
      items: classes.map((department) => ({
        key: String(department.id),
        label: department.name,
        // Most schools code a class differently from its name; this one does
        // not, and repeating "SSS I" beside "SSS I" says nothing.
        meta:
          String(department.id) === homeId
            ? 'Home class'
            : department.deptcode === department.name
              ? ''
              : department.deptcode,
        count: 0,
      })),
      preselected: row?.classIds ? row.classIds.split(',').filter(Boolean) : undefined,
      note: 'The home class stays whether it is ticked or not — a subject can never end up taught to nobody.',
      requiredMessage: 'Pick at least one class.',
    },
    fields: [],
    cta: 'Save these classes',
    footnote: 'Nothing changes until you press this.',
    run: async (values) => {
      const picked = (values.picks as string[] | undefined) ?? []
      await subjectsService.setClasses(String(row?.id ?? ''), {
        classes: picked.map(Number),
      })
      return {
        message: `${row?.name ?? 'The subject'} is taught to ${picked.length} ${picked.length === 1 ? 'class' : 'classes'}`,
      }
    },
    done: (picked) => `Taught to ${picked} ${picked === 1 ? 'class' : 'classes'}`,
  }
}

export const adminFlows: Record<string, AdminFlow> = {
  fees: { label: 'Allocate to classes', build: allocate },
  // Record-scoped, not `fromList`: a payment needs the invoice it settles,
  // and the queue's own search is how that invoice is found.
  collect: { label: 'Take a payment', when: payAction, build: payment },
  arms: { label: 'Place pupils', build: placePupils },
  subjects: { label: 'Teach to classes', build: teachTo },
  students: { label: 'Promote or transfer', build: promote },
  applicants: { label: 'Review application', build: review },
  library: { label: 'Issue this book', build: lend },
}
