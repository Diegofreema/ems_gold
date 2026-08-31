import type {
  MyTeachingProfile,
  UpdateMyTeachingProfileBody,
} from '../../api/teaching/types.ts'
import { BLANK } from '../../features/collections/blank.ts'
import type { ProfileConfig } from '../../features/profile/types.ts'
import { formatDate } from '../../lib/format.ts'

/**
 * The teaching record, as its owner reads it.
 *
 * Built from `GET /teachers/me` — the class, the subjects and the arms they
 * are class teacher of, none of which the login carries. Two boxes take an
 * edit: `POST /teachers/me` accepts a phone and an address and nothing else,
 * so everything else on the page is shown to read.
 */

const NOTE =
  'Your staff record as the school holds it. Your phone and address are yours to correct; your name, class and subjects are set by the school office.'

const SESSION_NOTE =
  'Signs you out of the staff room computers without touching this browser.'

const FIELDS: ProfileConfig['fields'] = [
  { key: 'fullname', label: 'Full name', locked: true },
  { key: 'klass', label: 'Class', locked: true },
  { key: 'arms', label: 'Class teacher of', locked: true },
  { key: 'qualification', label: 'Qualification', locked: true },
  { key: 'gender', label: 'Gender', locked: true },
  { key: 'subjects', label: 'Subjects', locked: true, wide: true },
  { key: 'phone', label: 'Phone', required: true },
  { key: 'address', label: 'Address', required: true, wide: true },
]

/** The page for the moment before the record answers. */
const EMPTY: ProfileConfig = {
  initials: '··',
  meta: '',
  note: NOTE,
  sessionNote: SESSION_NOTE,
  fields: FIELDS,
  values: {
    fullname: '',
    klass: BLANK,
    arms: BLANK,
    qualification: BLANK,
    gender: BLANK,
    subjects: BLANK,
    phone: '',
    address: '',
  },
  // Left for the session to fill in: this shape is only reached when the
  // record did not answer, and the login is the one thing still known.
  account: [{ label: 'Signs in with', value: BLANK }],
  prefs: [
    { label: 'Email me when a batch is approved or rejected', hint: 'As it happens', on: true },
    { label: 'Remind me about open score sheets', hint: 'Every Monday morning', on: true },
    { label: 'SMS for e-class changes', hint: 'One hour before the session', on: false },
  ],
}

function text(value: string | null | undefined): string {
  return value?.trim() || BLANK
}

function fullName(...parts: (string | null | undefined)[]): string {
  return parts.map((part) => part?.trim()).filter(Boolean).join(' ')
}

/** Two letters for the square, off whichever half of the name is filled in. */
function initialsOf(parts: (string | null | undefined)[]): string {
  const letters = parts.map((part) => part?.trim()[0]).filter(Boolean)
  return letters.length ? letters.join('').toUpperCase() : '··'
}

/** An ISO timestamp as the design writes dates. Anything else is left alone. */
function asDate(value: string | null | undefined): string {
  if (!value) return BLANK
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : formatDate(date)
}

export function teacherProfile(profile?: MyTeachingProfile): ProfileConfig {
  if (!profile) return EMPTY

  const { teacher } = profile
  const arms = profile.class_arms.map((arm) => arm.arm_name).join(', ')
  const subjects = (teacher.subjects ?? []).map((subject) => subject.name).join(', ')
  const staffNo = teacher.user?.useruniquid

  return {
    ...EMPTY,
    initials: initialsOf([teacher.firstname, teacher.lastname]),
    meta: [staffNo, teacher.department?.name, arms].filter(Boolean).join(' · '),
    values: {
      fullname: fullName(teacher.firstname, teacher.middlename, teacher.lastname),
      klass: text(teacher.department?.name),
      // A teacher who takes no arm is the ordinary case, not a gap in the
      // record, so it says so in words rather than showing a dash.
      arms: arms || 'Not a class teacher this session.',
      qualification: text(teacher.qualification),
      gender: text(teacher.gender),
      subjects: subjects || 'None yet — the office sets what you teach.',
      phone: teacher.phone ?? '',
      address: teacher.address ?? '',
    },
    account: [
      { label: 'Signs in with', value: text(teacher.user?.username) },
      { label: 'Staff number', value: text(staffNo) },
      // Whether the login works at all, which the teaching record does not say.
      { label: 'Sign-in', value: text(teacher.user?.userstatus) },
      { label: 'On record since', value: asDate(teacher.date_created) },
    ],
    // Already the teacher's own record: the session has nothing to add to it.
    fromRecord: true,
  }
}

/**
 * The profile form as `POST /teachers/me` wants it. Only the two fields the
 * endpoint accepts are sent — the locked boxes are the office's, and an empty
 * one is dropped rather than blanking what the school holds.
 */
export function teacherContactBody(
  values: Record<string, unknown>,
): UpdateMyTeachingProfileBody {
  const text = (key: string) =>
    typeof values[key] === 'string' ? (values[key] as string).trim() || undefined : undefined

  return { phone: text('phone'), address: text('address') }
}
