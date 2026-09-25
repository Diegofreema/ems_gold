import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { CircleCheck, CloudOff, Mail, Phone, User } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { FormProvider, useController, useForm, useFormContext, useWatch } from 'react-hook-form'
import { ApiError } from '@/api/client'
import { admissionsService } from '@/api/admissions/service'
import { DropZone } from '@/components/form/drop-zone'
import { Button } from '@/components/ui/button'
import { AuthAlert } from '@/features/auth/components/auth-alert'
import { authButton, authButtonQuiet } from '@/features/auth/components/auth-button'
import {
  AuthField,
  AuthFieldError,
  AuthSelectField,
} from '@/features/auth/components/auth-field'
import { AuthHeading } from '@/features/auth/components/auth-heading'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { errorMessage, OFFLINE_MESSAGE } from '@/lib/errors'
import { DOCUMENT_MAX_BYTES, readableSize } from '@/lib/file-size'
import { cn } from '@/lib/utils'
import { RELIGIONS } from '@/portals/admin/collections/student-row'
import {
  applicationBody,
  applicationReference,
  checkStep,
  draftOf,
  EMPTY_APPLICATION,
  firstFailingStep,
  restoreDraft,
  REVIEW_STEP,
  schoolFieldErrors,
  stepOf,
  STEPS,
  type ApplicationField,
  type ApplicationValues,
} from '../application'
import { useApplyClasses, useApplyLgas, useApplyStates, type Choice } from '../use-lookups'

/**
 * Where the typing is kept across a reload. The tab's own storage, not the
 * device's: this is a child's date of birth and a family's phone numbers,
 * typed on what may well be the school's shared laptop, and it has no
 * business outliving the tab it was typed in.
 */
const DRAFT_KEY = 'ems.apply.draft'

function readDraft(): string | null {
  try {
    return sessionStorage.getItem(DRAFT_KEY)
  } catch {
    return null
  }
}

function writeDraft(values: Partial<ApplicationValues> | undefined) {
  try {
    if (values) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draftOf(values)))
    else sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    /* A private window: the form still works, it just forgets on reload. */
  }
}

/** Today on this device, as a date box writes it — the latest birthday there can be. */
function today(): string {
  return new Date().toLocaleDateString('en-CA')
}

const GENDERS: Choice[] = [
  { value: 'Female', label: 'Female' },
  { value: 'Male', label: 'Male' },
]

// The four words the office's own student form stores, so an application
// opens in the admission record on the answer it was given.
const RELIGION_CHOICES: Choice[] = RELIGIONS.map((one) => ({ value: one, label: one }))

type Sent = { reference?: string; email: string }

/** Where a step lives: the first has no `?step=`, so the plain link is step one. */
function stepAddress(at: number, replace = false) {
  return {
    to: '/apply' as const,
    search: at === 0 ? {} : { step: STEPS[at].id },
    replace,
  }
}

/**
 * A family applying for a place, from the sign-in page. Four steps of boxes
 * and one to read it back, each checked as it is left; the school is asked
 * nothing until the last button, and a refusal it gives comes back under the
 * box it names, on the step that box is on.
 */
export function ApplyScreen() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/_auth/apply' })
  const index = Math.max(0, STEPS.findIndex((one) => one.id === (search.step ?? STEPS[0].id)))
  const step = STEPS[index]
  const online = useOnlineStatus()

  const form = useForm<ApplicationValues>({ defaultValues: restoreDraft(readDraft()) })
  const [sending, setSending] = useState(false)
  const [alert, setAlert] = useState<{ title: string; body: string }>()
  const [sent, setSent] = useState<Sent>()
  const heading = useRef<HTMLDivElement>(null)

  const go = (next: number, replace = false) => navigate(stepAddress(next, replace))

  // Keeps the typing in the tab as it happens. See `DRAFT_KEY`.
  const typed = useWatch({ control: form.control })
  useEffect(() => writeDraft(typed as Partial<ApplicationValues>), [typed])

  /*
   * A step is only reached through the ones before it. An address typed in,
   * or a reload that kept the step but lost a box, would otherwise open the
   * review on a form with a gap in it — so the family is taken back to the
   * gap, once, as the step is arrived at.
   */
  useEffect(() => {
    const failing = firstFailingStep(form.getValues(), today())
    if (failing !== undefined && failing < index) void navigate(stepAddress(failing, true))
    // Arriving on a step moves the reader to its heading, which is where a
    // screen reader should start and where a phone should be scrolled to.
    window.scrollTo({ top: 0 })
    heading.current?.focus({ preventScroll: true })
    // On arriving at a step, and only then — not on every keystroke.
  }, [form, index, navigate])

  // A new state has other local governments; the one picked for the old
  // state is not among them.
  const stateId = useWatch({ control: form.control, name: 'state_id' })
  const previousState = useRef(stateId)
  useEffect(() => {
    if (previousState.current !== stateId) form.setValue('lga_id', '')
    previousState.current = stateId
  }, [form, stateId])

  /** Raises one step's refusals under their boxes; true when there were none. */
  const holdUp = (at: number, errors: Partial<Record<ApplicationField, string>>) => {
    form.clearErrors(STEPS[at].fields as ApplicationField[])
    const keys = Object.keys(errors) as ApplicationField[]
    for (const key of keys) form.setError(key, { message: errors[key] })
    if (keys[0]) form.setFocus(keys[0])
    return keys.length === 0
  }

  const next = () => {
    setAlert(undefined)
    if (holdUp(index, checkStep(index, form.getValues(), today()))) void go(index + 1)
  }

  const send = async () => {
    setAlert(undefined)
    const values = form.getValues()
    const failing = firstFailingStep(values, today())
    if (failing !== undefined) {
      holdUp(failing, checkStep(failing, values, today()))
      void go(failing)
      return
    }

    setSending(true)
    try {
      const answer = await admissionsService.apply(applicationBody(values))
      writeDraft(undefined)
      setSent({ reference: applicationReference(answer), email: values.pemailaddress.trim() })
      form.reset({ ...EMPTY_APPLICATION })
    } catch (error) {
      const byBox = error instanceof ApiError ? schoolFieldErrors(error.errors) : {}
      const boxes = Object.keys(byBox) as ApplicationField[]
      if (boxes.length > 0) {
        // The school named what it would not take: go and show it there.
        const first = Math.min(...boxes.map(stepOf))
        for (const key of boxes) form.setError(key, { message: byBox[key] })
        void go(first)
        return
      }
      setAlert({
        title: 'Your application was not sent',
        body: errorMessage(error, OFFLINE_MESSAGE),
      })
    } finally {
      setSending(false)
    }
  }

  if (sent) return <SentNote sent={sent} />

  const reviewing = index === REVIEW_STEP

  return (
    <>
      <StepMeter index={index} />

      <div ref={heading} tabIndex={-1} className="mt-5 outline-none">
        <AuthHeading title={step.title} description={step.blurb} />
      </div>

      {alert && <AuthAlert title={alert.title} body={alert.body} />}

      <FormProvider {...form}>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            if (reviewing) void send()
            else next()
          }}
          className="mt-(--auth-gap) flex flex-col gap-(--auth-gap)"
        >
          {step.id === 'student' && <StudentStep />}
          {step.id === 'contact' && <ContactStep />}
          {step.id === 'parents' && <ParentsStep />}
          {step.id === 'documents' && <DocumentsStep />}
          {step.id === 'review' && <ReviewStep onChange={(at) => void go(at)} />}

          {reviewing && !online && (
            <p className="flex items-start gap-2.5 rounded-md bg-ui-field px-4 py-3 text-sm leading-relaxed text-ui-muted">
              <CloudOff className="mt-0.5 size-4 flex-none" strokeWidth={2} aria-hidden="true" />
              This device is offline. Everything you have typed is kept on this page — send it
              once you are back online.
            </p>
          )}

          <div className={cn('mt-2 grid gap-3', index > 0 && 'grid-cols-2')}>
            {index > 0 && (
              <Button
                type="button"
                variant="outline"
                disabled={sending}
                onClick={() => void go(index - 1)}
                className={authButtonQuiet}
              >
                Back
              </Button>
            )}
            <Button
              type="submit"
              pending={sending}
              disabled={reviewing && !online}
              className={authButton}
            >
              {reviewing ? (sending ? 'Sending…' : 'Send application') : 'Continue'}
            </Button>
          </div>
        </form>
      </FormProvider>

      <p className="mt-(--auth-tail) text-center text-base">
        Already a student here?{' '}
        <Link to="/sign-in" className="font-semibold text-ui-blue-ink hover:underline">
          Sign In
        </Link>
      </p>
    </>
  )
}

/**
 * Where the family is, as a count and as a bar: "Step 2 of 5" says how far
 * there is to go, which is the question a long form raises on its first page.
 */
function StepMeter({ index }: { index: number }) {
  return (
    <div>
      <p className="text-sm font-medium text-ui-muted">
        Apply for admission · Step {index + 1} of {STEPS.length}
      </p>
      <ol className="mt-2.5 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${STEPS.length}, 1fr)` }}>
        {STEPS.map((one, at) => (
          <li
            key={one.id}
            aria-current={at === index ? 'step' : undefined}
            className={cn(
              'h-1.5 rounded-full transition-colors',
              at <= index ? 'bg-ui-blue' : 'bg-ui-field',
            )}
          >
            <span className="sr-only">
              {one.title}
              {at < index ? ', done' : at === index ? ', this step' : ''}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function StudentStep() {
  const classes = useApplyClasses()

  return (
    <>
      <AuthField<ApplicationValues> name="fname" label="First name" placeholder="Chidi" icon={User} autoComplete="off" />
      <AuthField<ApplicationValues> name="lname" label="Surname" placeholder="Okafor" icon={User} autoComplete="off" />
      <AuthField<ApplicationValues> name="mname" label="Middle name" placeholder="Ebuka" optional autoComplete="off" />
      <AuthField<ApplicationValues> name="dob" label="Date of birth" type="date" max={today()} />
      <AuthSelectField<ApplicationValues> name="gender" label="Gender" options={GENDERS} />
      <AuthSelectField<ApplicationValues> name="religion" label="Religion" options={RELIGION_CHOICES} />
      <AuthSelectField<ApplicationValues>
        name="department_id"
        label="Class applying into"
        options={classes.data ?? []}
        placeholder={classes.isPending ? 'Loading the classes…' : 'Choose a class'}
        disabled={!classes.data}
        note={
          classes.isError ? (
            <>
              The school’s classes could not be loaded, and an application needs one.{' '}
              <button
                type="button"
                onClick={() => void classes.refetch()}
                className="font-semibold text-ui-blue-ink hover:underline"
              >
                Try again
              </button>
            </>
          ) : undefined
        }
      />
    </>
  )
}

function ContactStep() {
  const stateId = useWatch<ApplicationValues, 'state_id'>({ name: 'state_id' })
  const states = useApplyStates()
  const lgas = useApplyLgas(stateId)
  // Optional, so a list that cannot be had is a box left out rather than a
  // box that says so: nothing about the application waits on it.
  const offerLgas = Boolean(stateId) && !lgas.isError && (lgas.isPending || (lgas.data?.length ?? 0) > 0)

  return (
    <>
      <AuthField<ApplicationValues> name="phone" label="Phone number" type="tel" placeholder="0803 123 4567" icon={Phone} autoComplete="tel" />
      <AuthField<ApplicationValues>
        name="email"
        label="Student’s email"
        type="email"
        placeholder="Only if they have their own"
        icon={Mail}
        optional
        autoComplete="off"
      />
      <AuthField<ApplicationValues> name="address" label="Home address" placeholder="14 Douglas Road, Owerri" autoComplete="street-address" />
      <AuthSelectField<ApplicationValues>
        name="state_id"
        label="State of origin"
        options={states.data ?? []}
        placeholder={states.isPending ? 'Loading the states…' : 'Choose a state'}
        disabled={!states.data}
      />
      {offerLgas && (
        <AuthSelectField<ApplicationValues>
          name="lga_id"
          label="Local government area"
          options={lgas.data ?? []}
          placeholder={lgas.isPending ? 'Loading…' : 'Choose one'}
          disabled={!lgas.data}
          optional
        />
      )}
      <AuthField<ApplicationValues>
        name="pschools"
        label="Previous school"
        placeholder="Sunrise Primary School"
        optional
        autoComplete="off"
      />
    </>
  )
}

/** A heading between the two parents, so seven boxes read as two small groups. */
function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-(--auth-gap)">
      <legend className="mb-(--auth-gap) text-sm font-semibold tracking-wide text-ui-muted uppercase">
        {title}
      </legend>
      {children}
    </fieldset>
  )
}

function ParentsStep() {
  return (
    <>
      <p className="-mt-2 text-sm leading-relaxed text-ui-muted">
        One parent or guardian is enough. Fill in whoever the school should speak to.
      </p>
      <Group title="Father">
        <AuthField<ApplicationValues> name="fathersname" label="Full name" placeholder="Emeka Okafor" icon={User} autoComplete="off" />
        <AuthField<ApplicationValues> name="fatherphone" label="Phone number" type="tel" placeholder="0803 111 1111" icon={Phone} autoComplete="off" />
        <AuthField<ApplicationValues> name="fathersjob" label="Occupation" placeholder="Trader" optional autoComplete="off" />
      </Group>
      <Group title="Mother">
        <AuthField<ApplicationValues> name="mothersname" label="Full name" placeholder="Ngozi Okafor" icon={User} autoComplete="off" />
        <AuthField<ApplicationValues> name="motherphone" label="Phone number" type="tel" placeholder="0803 222 2222" icon={Phone} autoComplete="off" />
        <AuthField<ApplicationValues> name="mothersjob" label="Occupation" placeholder="Teacher" optional autoComplete="off" />
      </Group>
      <Group title="Family">
        <AuthField<ApplicationValues>
          name="pemailaddress"
          label="Family email address"
          type="email"
          placeholder="okafor.family@example.com"
          icon={Mail}
          autoComplete="email"
        />
      </Group>
    </>
  )
}

function DocumentsStep() {
  return (
    <>
      <DocumentField name="passport" label="Passport photograph" accept="image/*" />
      <DocumentField name="birth_certificate" label="Birth certificate" accept="image/*,.pdf" />
      <DocumentField
        name="other_certificates"
        label="Other certificates"
        accept="image/*,.pdf"
        note="A medical record, a health certificate — anything else the school should have."
      />
    </>
  )
}

function DocumentField({
  name,
  label,
  accept,
  note,
}: {
  name: 'passport' | 'birth_certificate' | 'other_certificates'
  label: string
  accept: string
  note?: string
}) {
  const { control, clearErrors } = useFormContext<ApplicationValues>()
  const { field, fieldState } = useController({ control, name })
  const error = fieldState.error?.message

  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-base font-medium">
        {label}
        <span className="ml-1.5 text-sm font-normal text-ui-hint">Optional</span>
      </label>
      <DropZone
        id={name}
        accept={accept}
        maxSize={DOCUMENT_MAX_BYTES}
        invalid={Boolean(error)}
        file={field.value instanceof File ? field.value : undefined}
        onFile={(file) => {
          field.onChange(file)
          clearErrors(name)
        }}
      />
      {error ? (
        <AuthFieldError>{error}</AuthFieldError>
      ) : (
        note && <p className="mt-1.5 text-[13px] leading-relaxed text-ui-muted">{note}</p>
      )}
    </div>
  )
}

/** A birthday as a person reads it — "12 March 2011" — read as the day it is. */
function readableDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return value
  return new Date(year, month - 1, day).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const labelOf = (choices: Choice[] | undefined, value: string) =>
  choices?.find((one) => one.value === value)?.label ?? ''

/** Each part of the application, read back, with the way to change it. */
function ReviewStep({ onChange }: { onChange: (step: number) => void }) {
  const values = useWatch<ApplicationValues>() as ApplicationValues
  const classes = useApplyClasses()
  const states = useApplyStates()
  const lgas = useApplyLgas(values.state_id)

  const person = (name: string, phone: string, job: string) =>
    [name, phone, job].map((part) => part?.trim()).filter(Boolean).join(' · ')
  const document = (file: File | undefined) =>
    file instanceof File ? `${file.name} (${readableSize(file.size)})` : 'Not attached'

  const parts: { step: number; rows: [string, string][] }[] = [
    {
      step: 0,
      rows: [
        ['Name', [values.fname, values.mname, values.lname].map((part) => part?.trim()).filter(Boolean).join(' ')],
        ['Date of birth', values.dob ? readableDate(values.dob) : ''],
        ['Gender', values.gender],
        ['Religion', values.religion],
        ['Applying into', labelOf(classes.data, values.department_id)],
      ],
    },
    {
      step: 1,
      rows: [
        ['Phone', values.phone],
        ['Student’s email', values.email],
        ['Home address', values.address],
        [
          'State of origin',
          [labelOf(lgas.data, values.lga_id), labelOf(states.data, values.state_id)].filter(Boolean).join(', '),
        ],
        ['Previous school', values.pschools],
      ],
    },
    {
      step: 2,
      rows: [
        ['Father', person(values.fathersname, values.fatherphone, values.fathersjob)],
        ['Mother', person(values.mothersname, values.motherphone, values.mothersjob)],
        ['Family email', values.pemailaddress],
      ],
    },
    {
      step: 3,
      rows: [
        ['Passport photograph', document(values.passport)],
        ['Birth certificate', document(values.birth_certificate)],
        ['Other certificates', document(values.other_certificates)],
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      {parts.map((part) => (
        <section key={part.step} className="rounded-lg bg-ui-field px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold">{STEPS[part.step].title}</h3>
            <button
              type="button"
              onClick={() => onChange(part.step)}
              className="text-sm font-medium text-ui-blue-ink hover:underline"
            >
              Change<span className="sr-only"> {STEPS[part.step].title.toLowerCase()}</span>
            </button>
          </div>
          <dl className="mt-2 flex flex-col gap-1.5 text-sm">
            {part.rows.map(([term, value]) => (
              <div key={term} className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-3">
                <dt className="text-ui-muted">{term}</dt>
                <dd className={cn('break-words', !value && 'text-ui-hint')}>{value || '—'}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}

/**
 * What a family is told once the school has the application. The number is
 * shown only where the school's answer carried one — see
 * `applicationReference` — and never made up.
 */
function SentNote({ sent }: { sent: Sent }) {
  return (
    <>
      <div className="mb-5 grid size-12 place-items-center rounded-full bg-success-subtle text-success-ink">
        <CircleCheck className="size-6" strokeWidth={2} aria-hidden="true" />
      </div>
      <AuthHeading
        title="Application sent"
        description="The school has your application. The office reviews each one and will be in touch."
      />

      {sent.reference && (
        <div className="mt-6 rounded-lg bg-ui-field px-4 py-3.5">
          <div className="text-sm text-ui-muted">Your application number</div>
          <div className="mt-1 font-heading text-xl font-bold tracking-wide select-all">{sent.reference}</div>
          <div className="mt-1.5 text-[13px] text-ui-muted">
            Keep it — the office will ask for it if you call.
          </div>
        </div>
      )}

      {sent.email && (
        <p className="mt-5 text-base leading-relaxed text-ui-muted">
          Replies go to <span className="font-medium text-ui-ink">{sent.email}</span>.
        </p>
      )}

      <Button asChild className={`mt-(--auth-tail) ${authButton}`}>
        <Link to="/sign-in">Back to sign in</Link>
      </Button>
    </>
  )
}
