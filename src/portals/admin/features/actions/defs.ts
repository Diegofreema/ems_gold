import { classArmsService } from '@/api/class-arms/service'
import { departmentsService } from '@/api/departments/service'
import { feesService } from '@/api/fees/service'
import { invoicesService } from '@/api/invoices/service'
import { studentsService } from '@/api/students/service'
import { optionLabels } from '@/features/collections/option-feeds'
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
import type { ActionDef } from './types'

export type AdminFlow = {
  /** Button label on the record, e.g. "Allocate to classes". */
  label: string
  /** The flow needs no record, so the list's primary action opens it. */
  fromList?: boolean
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
 * `POST /invoices/{id}/settle` marks the whole invoice paid in one move and
 * names the pupil, so a mistyped reference cannot clear someone else's bill.
 * That is all it records: there is no part payment, and nowhere to put a
 * method or a teller number, so the flow does not ask for either. The endpoint
 * that carries them is `collect-fees/{id}/pay`, which is not deployed yet.
 */
function payment(row?: Row): ActionDef {
  // Opened from a parent's record the flow already knows the household, which
  // is worth showing; it still cannot know which of their children is paying.
  const household = row?.name

  return {
    kicker: 'Finance · Fee collection',
    title: 'Take a payment',
    description:
      'Find the pupil, pick the invoice being settled, then record it. The invoice is marked paid in full and the parent sees it straight away.',
    // Only the household: the parent record keeps its children in a tab, not
    // in a column, so a "Children" tile here would read as a dash every time.
    summary: household ? [{ label: 'Parent', value: household }] : [],
    fields: [
      {
        key: 'student_id',
        label: 'Pupil',
        required: true,
        wide: true,
        optionsFrom: 'students',
        hint: 'Search by name or admission number.',
      },
      {
        key: 'invoice_id',
        label: 'Invoice to settle',
        required: true,
        wide: true,
        optionsFrom: 'unpaid-invoices',
        dependsOn: 'student_id',
        hint: 'Only invoices still owing are listed. Settling clears the whole amount.',
      },
    ],
    cta: 'Record payment',
    footnote: 'Nothing is settled until you press this.',
    // Named from the two feeds the selects just read, so the dialog says who
    // is paying and what for rather than "the invoice you picked" — this is
    // the last chance to notice the wrong one.
    confirm: async (_total, values) => {
      const pupil = String(values?.student_id ?? '')
      const [pupils, invoices] = await Promise.all([
        optionLabels('students'),
        optionLabels('unpaid-invoices', pupil),
      ])
      return {
        title: 'Settle this invoice?',
        body: 'This records the invoice as paid in full and closes its transaction. There is no undoing it from here.',
        subject: [pupils.get(pupil), invoices.get(String(values?.invoice_id ?? ''))]
          .filter(Boolean)
          .join(' · '),
        cta: 'Record the payment',
        cancel: 'Go back',
      }
    },
    run: async (values) => {
      await invoicesService.settle(String(values.invoice_id), {
        student_id: Number(values.student_id),
      })
      return { message: 'Payment recorded — invoice settled' }
    },
    done: () => 'Payment recorded — invoice settled',
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
  // Not on `invoices`: an invoice's own page settles it from the row action,
  // and two buttons doing one thing is one too many.
  parents: { label: 'Take a payment', build: payment },
  students: { label: 'Promote or transfer', build: promote },
  applicants: { label: 'Review application', build: review },
  library: { label: 'Issue this book', build: lend },
}
