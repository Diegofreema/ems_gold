import { z } from 'zod'
import type { ApplicationBody, NamedRow } from '../../api/admissions/types.ts'
import { schoolCountryId, STATES_KNOWN_FOR } from '../collections/country-ids.ts'
import { DOCUMENT_MAX_BYTES, tooLargeMessage } from '../../lib/file-size.ts'

/**
 * The admission application, as a family fills it in from the sign-in page.
 *
 * One form in several steps, because it is thirty-odd boxes long and it is
 * filled in on a phone: a page that long scrolled past the first mistake, and
 * the family found out about a missing date of birth at the very bottom. Each
 * step is checked when it is left, so a refusal is always on the screen being
 * looked at.
 */
export type ApplicationValues = {
  fname: string
  lname: string
  mname: string
  dob: string
  gender: string
  religion: string
  department_id: string
  phone: string
  email: string
  address: string
  state_id: string
  lga_id: string
  pschools: string
  fathersname: string
  fatherphone: string
  fathersjob: string
  mothersname: string
  motherphone: string
  mothersjob: string
  pemailaddress: string
  passport?: File
  birth_certificate?: File
  other_certificates?: File
}

export type ApplicationField = keyof ApplicationValues

/** The boxes somebody types or picks into — everything but the documents. */
type TextField = Exclude<ApplicationField, 'passport' | 'birth_certificate' | 'other_certificates'>

/** Every text box, empty — what the form opens on, before any draft. */
export const EMPTY_APPLICATION: Record<TextField, string> = {
  fname: '',
  lname: '',
  mname: '',
  dob: '',
  gender: '',
  religion: '',
  department_id: '',
  phone: '',
  email: '',
  address: '',
  state_id: '',
  lga_id: '',
  pschools: '',
  fathersname: '',
  fatherphone: '',
  fathersjob: '',
  mothersname: '',
  motherphone: '',
  mothersjob: '',
  pemailaddress: '',
}

export const DOCUMENT_FIELDS = ['passport', 'birth_certificate', 'other_certificates'] as const

const required = z.string().trim().min(1, 'Required')
const optional = z.string().trim()

/** Digits, spaces, dashes and a leading plus — a Nigerian mobile is eleven. */
const phonePattern = /^\+?[0-9][0-9\s-]{6,18}$/
const phone = optional.refine((value) => !value || phonePattern.test(value), 'That does not look like a phone number')
const email = optional.refine(
  (value) => !value || z.email().safeParse(value).success,
  'That does not look like an email address',
)

/** Not in the future, which is the one thing a date box can be sure of. */
function dob(today: string) {
  return required
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'A date, as the calendar gives it')
    .refine((value) => value <= today, 'A date of birth cannot be in the future')
}

const document = z
  .instanceof(File)
  .superRefine((file, context) => {
    if (file.size > DOCUMENT_MAX_BYTES) {
      context.addIssue({ code: 'custom', message: tooLargeMessage(file.size, DOCUMENT_MAX_BYTES) })
    }
  })
  .optional()

export type Step = {
  id: 'student' | 'contact' | 'parents' | 'documents' | 'review'
  title: string
  /** One line under the heading saying what the step is for. */
  blurb: string
  fields: readonly ApplicationField[]
}

export const STEPS: readonly Step[] = [
  {
    id: 'student',
    title: 'The student',
    blurb: 'Who is applying, and the class they are applying into.',
    fields: ['fname', 'lname', 'mname', 'dob', 'gender', 'religion', 'department_id'],
  },
  {
    id: 'contact',
    title: 'Home and school',
    blurb: 'Where the student lives, and the school they are coming from.',
    fields: ['phone', 'email', 'address', 'state_id', 'lga_id', 'pschools'],
  },
  {
    id: 'parents',
    title: 'Parents',
    blurb: 'Who the school should speak to about this application.',
    fields: [
      'fathersname',
      'fatherphone',
      'fathersjob',
      'mothersname',
      'motherphone',
      'mothersjob',
      'pemailaddress',
    ],
  },
  {
    id: 'documents',
    title: 'Documents',
    blurb: 'Optional, and each one at most 1 MB. A clear phone photo is enough.',
    fields: DOCUMENT_FIELDS,
  },
  {
    id: 'review',
    title: 'Check and send',
    blurb: 'Read it through once. Nothing is sent until you press the button.',
    fields: [],
  },
]

/** The step that is the last one before sending. */
export const REVIEW_STEP = STEPS.length - 1

/**
 * One validator per step, built against today's date so the date-of-birth
 * rule is testable. The parents' rules are about the step as a whole rather
 * than one box: a family may have only a mother or only a father, but the
 * school has to have somebody to speak to and some number to ring.
 */
function stepSchema(step: Step['id'], today: string): z.ZodType {
  switch (step) {
    case 'student':
      return z.object({
        fname: required,
        lname: required,
        mname: optional,
        dob: dob(today),
        gender: required,
        religion: required,
        department_id: z.string().min(1, 'Pick the class they are applying into'),
      })
    case 'contact':
      return z.object({
        phone: required.pipe(phone),
        email,
        address: required,
        state_id: z.string().min(1, 'Pick a state'),
        lga_id: optional,
        pschools: optional,
      })
    case 'parents':
      return z
        .object({
          fathersname: optional,
          fatherphone: phone,
          fathersjob: optional,
          mothersname: optional,
          motherphone: phone,
          mothersjob: optional,
          pemailaddress: required.pipe(email),
        })
        // `when` makes these run beside the boxes' own checks rather than only
        // once every box has passed, so a family is told everything at once.
        .superRefine((values, context) => {
          if (!values.fathersname && !values.mothersname) {
            context.addIssue({
              code: 'custom',
              path: ['fathersname'],
              message: 'Give at least one parent or guardian’s name',
            })
          }
          if (!values.fatherphone && !values.motherphone) {
            context.addIssue({
              code: 'custom',
              path: [values.mothersname && !values.fathersname ? 'motherphone' : 'fatherphone'],
              message: 'Give at least one phone number the school can ring',
            })
          }
        }, { when: () => true })
    case 'documents':
      return z.object({
        passport: document,
        birth_certificate: document,
        other_certificates: document,
      })
    case 'review':
      return z.object({})
  }
}

/**
 * What is wrong with one step, field by field — empty when it may be left.
 * The first message for a field wins, which is the one about its own box.
 */
export function checkStep(
  index: number,
  values: Partial<ApplicationValues>,
  today: string,
): Partial<Record<ApplicationField, string>> {
  const step = STEPS[index]
  if (!step) return {}
  const picked = Object.fromEntries(
    step.fields.map((key) => [key, values[key] ?? (DOCUMENT_FIELDS.includes(key as never) ? undefined : '')]),
  )
  const result = stepSchema(step.id, today).safeParse(picked)
  if (result.success) return {}

  const errors: Partial<Record<ApplicationField, string>> = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0] as ApplicationField | undefined
    if (key && !errors[key]) errors[key] = issue.message
  }
  return errors
}

/**
 * The first step with anything wrong on it, for a send that found a problem —
 * a draft restored from an earlier visit can be missing a box a step before
 * this one. Undefined when every step passes.
 */
export function firstFailingStep(values: Partial<ApplicationValues>, today: string): number | undefined {
  for (let index = 0; index < REVIEW_STEP; index++) {
    if (Object.keys(checkStep(index, values, today)).length > 0) return index
  }
  return undefined
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function attached<K extends string>(key: K, value: unknown): Partial<Record<K, File>> {
  return value instanceof File ? ({ [key]: value } as Record<K, File>) : {}
}

/** A select's value as the id the endpoint wants, or nothing. */
function asId(value: unknown): number | undefined {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

/**
 * The form as `POST /students/apply` wants it: every key, with an empty string
 * where nothing was typed, exactly as the school's own request is written.
 *
 * The country follows from the state: the states offered are the school's own
 * country's, whether they came from `GET /states` (which defaults to it) or
 * from the table on the device, which only knows Nigeria's. The school would
 * default it anyway; it is sent because the school's own request sends it.
 */
export function applicationBody(values: Partial<ApplicationValues>): ApplicationBody {
  const state = asId(values.state_id)
  const lga = asId(values.lga_id)

  return {
    fname: text(values.fname),
    lname: text(values.lname),
    mname: text(values.mname),
    dob: text(values.dob),
    gender: text(values.gender),
    address: text(values.address),
    phone: text(values.phone),
    // Checked before this is built: the step refuses to be left without one.
    department_id: asId(values.department_id) ?? 0,
    ...(state ? { state_id: state, country_id: schoolCountryId(STATES_KNOWN_FOR) } : {}),
    ...(lga ? { lga_id: lga } : {}),
    pschools: text(values.pschools),
    religion: text(values.religion),
    email: text(values.email),
    fathersname: text(values.fathersname),
    mothersname: text(values.mothersname),
    fatherphone: text(values.fatherphone),
    motherphone: text(values.motherphone),
    fathersjob: text(values.fathersjob),
    mothersjob: text(values.mothersjob),
    pemailaddress: text(values.pemailaddress),
    ...attached('passport', values.passport),
    ...attached('birth_certificate', values.birth_certificate),
    ...attached('other_certificates', values.other_certificates),
  }
}

/**
 * The number the school gave the application, where its answer carries one.
 *
 * The answer has never been read — the endpoint was handed over as a request
 * with no response beside it — so this looks where every other student answer
 * on this API keeps it: `application_no`, or the `regno` the student row falls
 * back to, on the answer itself or on the record it nests under. Finding none
 * is an answer too: the page says the application was received and does not
 * invent a number.
 */
export function applicationReference(answer: unknown): string | undefined {
  const candidates = [answer]
  if (answer && typeof answer === 'object') {
    for (const key of ['student', 'applicant', 'application']) {
      candidates.push((answer as Record<string, unknown>)[key])
    }
  }
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') continue
    const record = candidate as Record<string, unknown>
    for (const key of ['application_no', 'regno']) {
      const value = record[key]
      if ((typeof value === 'string' && value.trim()) || typeof value === 'number') {
        return String(value).trim()
      }
    }
  }
  return undefined
}

/**
 * The typed half of the form, for keeping in the tab across a reload. Files
 * are left out: a `File` cannot be written to storage, and the family picks
 * them again rather than being told they are still attached.
 */
export function draftOf(values: Partial<ApplicationValues>): Partial<ApplicationValues> {
  const draft: Record<string, string> = {}
  for (const key of Object.keys(EMPTY_APPLICATION) as TextField[]) {
    const value = values[key]
    if (typeof value === 'string' && value) draft[key] = value
  }
  return draft
}

/** A stored draft read back, keeping only the boxes this form has. */
export function restoreDraft(stored: string | null): ApplicationValues {
  if (!stored) return { ...EMPTY_APPLICATION }
  try {
    const parsed = JSON.parse(stored) as Record<string, unknown>
    const restored = { ...EMPTY_APPLICATION }
    for (const key of Object.keys(EMPTY_APPLICATION) as TextField[]) {
      const value = parsed[key]
      if (typeof value === 'string') restored[key] = value
    }
    return restored
  } catch {
    return { ...EMPTY_APPLICATION }
  }
}

/**
 * The rows of one public lookup, whichever envelope it came in.
 *
 * Only `/departments` was documented with its answer — `{departments: [...]}`
 * — so the others are read the same way under their own name, and also as a
 * bare list, which is the other shape this API's lists take. A row without a
 * usable id or name is dropped rather than offered as a blank choice.
 */
export function namedRows(answer: unknown, key: string): NamedRow[] {
  const list = Array.isArray(answer)
    ? answer
    : answer && typeof answer === 'object'
      ? (answer as Record<string, unknown>)[key]
      : undefined
  if (!Array.isArray(list)) return []

  const rows: NamedRow[] = []
  for (const row of list) {
    if (!row || typeof row !== 'object') continue
    const id = Number((row as Record<string, unknown>).id)
    const name = (row as Record<string, unknown>).name
    if (Number.isInteger(id) && id > 0 && typeof name === 'string' && name.trim()) {
      rows.push({ id, name: name.trim() })
    }
  }
  return rows
}

/** The step a box is on, so a refusal about it can send the family there. */
export function stepOf(field: ApplicationField): number {
  const index = STEPS.findIndex((step) => step.fields.includes(field))
  return index === -1 ? REVIEW_STEP : index
}

/**
 * The school's refusals, box by box, where it named boxes this form has.
 *
 * The API answers a refused save as `{field: {rule: message}}` — see
 * `ApiFieldErrors` — and the application's keys are the form's own, so a
 * message about `state_id` lands under the state. The one exception is
 * `country_id`, which the form never asks for: it is sent because a state
 * was picked, so its refusal belongs under the state. A refusal about a key
 * this form does not have is left to the banner, with the school's sentence.
 */
export function schoolFieldErrors(
  errors: Record<string, Record<string, string>> | undefined,
): Partial<Record<ApplicationField, string>> {
  const found: Partial<Record<ApplicationField, string>> = {}
  if (!errors) return found
  const known = new Set<string>([...Object.keys(EMPTY_APPLICATION), ...DOCUMENT_FIELDS])

  for (const [key, rules] of Object.entries(errors)) {
    const field = (key === 'country_id' ? 'state_id' : key) as ApplicationField
    if (!known.has(field) || found[field]) continue
    const message = rules && typeof rules === 'object' ? Object.values(rules).find(Boolean) : undefined
    if (typeof message === 'string') found[field] = message
  }
  return found
}
