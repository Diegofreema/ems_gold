import { queryOptions } from '@tanstack/react-query'
import { parentsService } from '@/api/parents/service'
import { studentsService } from '@/api/students/service'
import { heldDocument, heldRows as held } from '@/db/collection'
import {
  refArms,
  refBoard,
  refBooks,
  refClasses,
  refFees,
  refGuardians,
  refMethods,
  refRoles,
  refSessions,
  refStudents,
  refSubjects,
  refTeachers,
  refTerms,
} from '@/db/collections/reference'
import { teacherArms, teacherSubjects } from '@/db/collections/teaching'
import { queryClient } from '@/lib/query-client'
import { methodOptions } from './payment-methods'
import { guardianOption } from './guardian-option'
import { audienceOptions } from '@/portals/admin/collections/notice-row'
import { distinct, type Option, type OptionsKey, type SearchKey } from './options'

/**
 * Every feed here reads a set on the device rather than an endpoint.
 *
 * That is what makes a form fillable with no connection — a dropdown that had
 * to be fetched is a form that cannot be filled in — and it is why the ones
 * that used to ask the API for a narrowed answer now ask for the whole set and
 * narrow it here. A set narrowed at the fetch cannot be widened later without a
 * second request, and there may be no connection to make one over.
 *
 * The react-query wrapper below stays: it is what the select components
 * already speak, and it now dedupes the reading rather than the request.
 */

export function optionsQuery(key: OptionsKey, dependsOn: string) {
  return queryOptions({
    queryKey: ['options', key, dependsOn],
    queryFn: () => fetchOptions(key, dependsOn),
    // Reference data: it changes when the school is reorganised, not mid-form.
    staleTime: 5 * 60_000,
    /**
     * Deliberately `always`, not the app's default.
     *
     * Under `online` react-query pauses without running the function at all, so
     * a feed the office had not already opened stayed on "Loading…" for as long
     * as the device was offline — which is every dependent feed, since an arm
     * feed is keyed by the class chosen and no class had been chosen before.
     * The reading is off the device now and can always finish, so letting it
     * run is what makes the form fillable.
     */
    networkMode: 'always',
  })
}

async function fetchOptions(key: OptionsKey, dependsOn: string): Promise<Option[]> {
  if (key === 'classes') {
    const items = await held(refClasses)
    return distinct(
      items.map((department) => ({
        value: String(department.id),
        label: department.name,
        // Most schools code a class differently from its name; this one does
        // not, so the code is only offered where it says something new.
        meta: department.deptcode === department.name ? '' : department.deptcode,
      })),
    )
  }

  if (key === 'audiences') {
    // The board publishes its own catalogue beside its list, so the form
    // offers exactly what the endpoint will accept rather than a copy of it
    // that can drift.
    return audienceOptions((await heldDocument(refBoard))?.audiences ?? [])
  }

  if (key === 'arms') {
    // An arm only means something inside a class, so this feed stays empty
    // until one is chosen rather than offering every arm in the school.
    if (!dependsOn) return []
    // Narrowed here rather than by `class-arms/for-department/{id}`, which is a
    // different answer per class and so cannot be a set on the device. An arm
    // carries the class it belongs to, so the same answer is this set filtered
    // — and filtered without a request.
    const arms = (await held(refArms)).filter(
      (arm) => String(arm.department_id) === String(dependsOn),
    )
    // The endpoint's own label reads "JSS 1 - JSS1 A" — class and arm together,
    // which is what makes the choice unambiguous where two classes both have
    // an A — so it is spelled the same way here.
    return arms.map((arm) => ({
      value: String(arm.id),
      label: [arm.department, arm.arm_name].filter(Boolean).join(' - ') || arm.arm_name,
    }))
  }

  if (key === 'all-arms') {
    // Unlike `arms`, this is not narrowed by a class: a teacher's arm has
    // nothing to do with the department they teach, so the whole school's arms
    // are offered, each labelled with its class to keep an "A" from every "A".
    const items = await held(refArms)
    return items.map((arm) => ({
      value: String(arm.id),
      label: [arm.department, arm.arm_name].filter(Boolean).join(' \u00b7 ') || arm.arm_name,
    }))
  }

  if (key === 'students') {
    // Admitted alone, filtered here rather than at the fetch: the set on the
    // device is the whole register, because the office's own list and the
    // applicants beside it read the same one.
    return (await held(refStudents))
      .filter((student) => student.status === 'Admitted')
      .map(studentOption)
  }

  if (key === 'all-books') {
    // Every title, for the edit flow — a retired one is exactly the title an
    // office may need to fix or put back on lending, so nothing is filtered.
    const books = await held(refBooks)
    return distinct(
      books.map((book) => ({
        value: String(book.id),
        label:
          book.isavailable === 'Unavailable' ? `${book.title} · retired` : book.title,
        meta: book.author ?? '',
      })),
    )
  }

  if (key === 'books') {
    // Only titles the office has left lendable are offered; whether a copy is
    // actually on the shelf is the lend endpoint's own 409 to give. The
    // catalogue comes back whole — it ignores paging — so no limit is sent.
    const books = await held(refBooks)
    return distinct(
      books
        .filter((book) => book.isavailable === 'Available')
        .map((book) => ({
          value: String(book.id),
          label: book.title,
          // Two copies of a set text can be two rows; the author tells the
          // reader which row is which before the id has to.
          meta: book.author ?? '',
        })),
    )
  }

  if (key === 'fees') {
    // Retired fees are left out: an invoice raised against one could not be
    // charged, and the catalogue keeps them only so old invoices still read.
    // Filtered here rather than at the fetch, so the set on the device is the
    // whole catalogue and a register that wants a retired fee still has it.
    const items = await held(refFees)
    return items
      .filter((fee) => Number(fee.status) === 1)
      .map((fee) => ({ value: String(fee.id), label: fee.name }))
  }

  if (key === 'subjects') {
    // Withdrawn subjects are left out: a class cannot be taught one, and the
    // register keeps them only so old results still read. Filtered here for the
    // same reason as the fees above.
    const items = (await held(refSubjects)).filter(
      (subject) => Number(subject.status) === 1,
    )
    return items.map((subject) => ({
      value: String(subject.id),
      // Two schools' worth of "Mathematics" are told apart by the class that
      // owns the subject, so it is offered beside the name.
      label: subject.department ? `${subject.name} · ${subject.department}` : subject.name,
    }))
  }

  if (key === 'my-subjects') {
    // A teacher cannot read `/subjects` at all — it answers "restricted to
    // administrators" — and has no business filing a topic under a subject
    // that is not theirs, so the feed is the one the office gave them.
    //
    // Off the device, and the same set the subject register draws: a form
    // whose dropdown had to be fetched would be a form that cannot be filled
    // in without a connection, which is most of the point of filing a topic
    // from a classroom.
    const subjects = await held(teacherSubjects)
    return distinct(
      subjects.map((subject) => ({
        value: String(subject.id),
        label: subject.name,
        meta: subject.department?.name ?? '',
      })),
    )
  }

  if (key === 'my-classes') {
    /*
     * A teaching login can read no register of classes — `/departments`,
     * `/class-arms` and `/subjects` all answer "restricted to administrators" —
     * so the classes offered are the ones the teacher's own record names: the
     * class behind every subject they were given, and behind every arm they
     * take. A teacher given neither is offered nothing, which is the truth:
     * the office has not put them in front of a class yet. Both halves come
     * off the device's own sets, like every other feed here — this was the
     * one feed left asking the school, and offline it left the assignment
     * form's required class field with nothing to offer.
     */
    const [subjects, arms] = await Promise.all([held(teacherSubjects), held(teacherArms)])
    const classes = new Map<number, { name: string; code: string }>()
    for (const one of [
      ...subjects.map((subject) => subject.department),
      ...arms.map((arm) => arm.department),
    ]) {
      if (one) classes.set(one.id, { name: one.name, code: one.deptcode ?? '' })
    }

    return distinct(
      [...classes].map(([id, { name, code }]) => ({
        value: String(id),
        label: name,
        // This school has two classes both named SSS I; the code tells them
        // apart where it differs, and the id where even that is the same.
        meta: code === name ? '' : code,
      })),
    )
  }

  if (key === 'my-arms') {
    // The arms come back beside the roll rather than on it, and one student is
    // enough of the roll to read them off — which is what the collection asks
    // for. Off the device, like the subjects above.
    const class_arms = await held(teacherArms)
    return class_arms.map((arm) => ({
      value: String(arm.id),
      label: arm.department?.name ? `${arm.department.name} · ${arm.arm_name}` : arm.arm_name,
    }))
  }

  if (key === 'sessions' || key === 'terms') {
    /*
     * Newest first for sessions — a family asking about a year is nearly always
     * asking about this one or the last — which now has to be said rather than
     * taken from the endpoint's order: a collection is keyed and hands its rows
     * back in key order however they arrived.
     */
    const items = await held(key === 'sessions' ? refSessions : refTerms)
    return [...items]
      .sort((one, two) => (key === 'sessions' ? two.id - one.id : one.id - two.id))
      .map((record) => ({ value: String(record.id), label: record.name }))
  }

  if (key === 'roles') {
    const roles = await held(refRoles)
    return roles.map((role) => ({ value: String(role.id), label: role.role_name }))
  }

  if (key === 'countries' || key === 'states') {
    // Imported here so the world's states land in a chunk of their own,
    // fetched when a staff form is opened and not before.
    const { countryOptions, stateOptions } = await import('./countries')
    if (key === 'countries') return countryOptions()
    return dependsOn ? stateOptions(dependsOn) : []
  }

  if (key === 'payment-methods') {
    // Named by the API rather than listed here, so a school that stops
    // taking cheques stops being offered cheque.
    return methodOptions((await heldDocument(refMethods)) ?? {})
  }

  if (key === 'teachers') {
    const items = await held(refTeachers)
    return distinct(
      items.map((teacher) => ({
        value: String(teacher.id),
        label:
          [teacher.firstname, teacher.lastname].filter(Boolean).join(' ').trim() ||
          `Teacher ${teacher.id}`,
        // Two members of staff really can share a name; the middle one is
        // what tells them apart before the id has to.
        meta: teacher.middlename?.trim() ?? '',
      })),
    )
  }

  return (await held(refGuardians)).map(guardianOption)
}

/**
 * A feed as a lookup from id to label, for a register that holds a foreign key
 * the list endpoint does not expand — a student's guardian, an arm's class. It
 * reads the same cache the forms' selects do, so asking for it costs a request
 * only when nothing has needed that feed for five minutes, and a feed that
 * fails leaves the column falling back rather than the page failing with it.
 */
export async function optionLabels(
  key: OptionsKey,
  dependsOn = '',
): Promise<ReadonlyMap<string, string>> {
  const options = await queryClient
    .query(optionsQuery(key, dependsOn))
    .catch(() => [])
  return new Map(options.map((option) => [option.value, option.label]))
}

/**
 * A searchable feed, asked with the term the office has typed so far. Guardians
 * run to the hundreds, so the whole list is never loaded — an empty term shows
 * the first page, and each keystroke (once settled) narrows it server-side.
 */
export function searchOptionsQuery(key: SearchKey, term: string) {
  return queryOptions({
    queryKey: ['search', key, term],
    queryFn: () => searchFeed(key, term),
    // A name searched once is likely searched again as the office corrects a
    // typo; a minute is long enough to spare the round trip, short enough that
    // a guardian added meanwhile still turns up.
    staleTime: 60_000,
    // As above, and doubly so here: this one asks the school first and falls
    // back to the device, and a paused query never reaches the fallback.
    networkMode: 'always',
  })
}

/** How many a search offers before the office is asked to type more. */
const FOUND = 20

/**
 * Whether what the office typed is in this option's text.
 *
 * The label is the whole of it on both searched feeds: a student's is the name
 * and the admission number, and a guardian's is both parents' names — which is
 * what the office is typing, and what the school's own search matches on.
 */
function matches(option: Option, needle: string): boolean {
  return !needle || option.label.toLowerCase().includes(needle)
}

/**
 * The searched feeds, asked of the school first and of the device when the
 * school cannot be reached.
 *
 * These are the one place a request is still the right answer: they exist for
 * registers too long to hold — every guardian, every admitted student — and the
 * endpoint searches the whole of one where this device holds at most the first
 * couple of hundred. So the school stays the authority.
 *
 * But a bursar at the counter with no signal is exactly who this app is for, so
 * a refusal falls back to searching what the device already keeps rather than
 * handing back nothing. That is narrower than the school's answer and honest
 * about it: the same set the unsearched feed offers, matched on the text.
 */
async function searchFeed(key: SearchKey, term: string): Promise<Option[]> {
  const needle = term.trim().toLowerCase()

  if (key === 'guardians') {
    return await parentsService
      .list({ q: term || undefined, limit: FOUND })
      .then((page) => page.items.map(guardianOption))
      .catch(async () =>
        (await held(refGuardians)).map(guardianOption).filter((one) => matches(one, needle)).slice(0, FOUND),
      )
  }

  if (key === 'students') {
    // The same register the `students` feed loads whole, narrowed server-side
    // by the name typed instead — for the flows where scrolling every admitted
    // student is worse than asking for the one being served.
    return await studentsService
      .list({ q: term || undefined, limit: FOUND, status: 'Admitted' })
      .then((page) => page.items.map(studentOption))
      .catch(async () =>
        (await held(refStudents)).map(studentOption).filter((one) => matches(one, needle)).slice(0, FOUND),
      )
  }

  return []
}

/**
 * One student as a select offers them. The admission number is what an office
 * bills and lends against, so it is offered beside the name rather than
 * instead of it.
 */
function studentOption(student: {
  id: number
  fname?: string | null
  mname?: string | null
  lname?: string | null
  regno?: string | null
}): Option {
  return {
    value: String(student.id),
    label:
      [
        [student.fname, student.mname, student.lname].filter(Boolean).join(' ').trim(),
        student.regno,
      ]
        .filter(Boolean)
        .join(' · ') || `Student ${student.id}`,
  }
}
