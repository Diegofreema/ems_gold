import { queryOptions } from '@tanstack/react-query'
import { sessionsService, termsService } from '@/api/calendar/service'
import { classArmsService } from '@/api/class-arms/service'
import { paymentMethods } from '@/api/collect-fees/hooks'
import { departmentsService } from '@/api/departments/service'
import { feesService } from '@/api/fees/service'
import { libraryService } from '@/api/library/service'
import { noticesService } from '@/api/notifications/service'
import { parentsService } from '@/api/parents/service'
import { studentsService } from '@/api/students/service'
import { subjectsService } from '@/api/subjects/service'
import { teachingService } from '@/api/teaching/service'
import { teachersService } from '@/api/teachers/service'
import { usersService } from '@/api/users/service'
import { queryClient } from '@/lib/query-client'
import { methodOptions } from './payment-methods'
import { guardianOption } from './guardian-option'
import { audienceOptions } from '@/portals/admin/collections/notice-row'
import { distinct, type Option, type OptionsKey, type SearchKey } from './options'

/** Everything on one page — a school has classes and arms in the dozens. */
const ALL = 200

export function optionsQuery(key: OptionsKey, dependsOn: string) {
  return queryOptions({
    queryKey: ['options', key, dependsOn],
    queryFn: () => fetchOptions(key, dependsOn),
    // Reference data: it changes when the school is reorganised, not mid-form.
    staleTime: 5 * 60_000,
  })
}

async function fetchOptions(key: OptionsKey, dependsOn: string): Promise<Option[]> {
  if (key === 'classes') {
    const { items } = await departmentsService.list({ limit: ALL })
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
    const { audiences } = await noticesService.all({ limit: 1 })
    return audienceOptions(audiences ?? [])
  }

  if (key === 'arms') {
    // An arm only means something inside a class, so this feed stays empty
    // until one is chosen rather than offering every arm in the school.
    if (!dependsOn) return []
    const arms = await classArmsService.forDepartment(dependsOn)
    // The feed's label already carries the class — "JSS 1 - JSS1 A" — which is
    // what makes the choice unambiguous where two classes both have an A.
    return arms.map((arm) => ({ value: String(arm.id), label: arm.label }))
  }

  if (key === 'all-arms') {
    // Unlike `arms`, this is not narrowed by a class: a teacher's arm has
    // nothing to do with the department they teach, so the whole school's arms
    // are offered, each labelled with its class to keep an "A" from every "A".
    const { items } = await classArmsService.list({ limit: ALL })
    return items.map((arm) => ({
      value: String(arm.id),
      label: [arm.department, arm.arm_name].filter(Boolean).join(' \u00b7 ') || arm.arm_name,
    }))
  }

  if (key === 'students') {
    const { items } = await studentsService.list({ limit: ALL, status: 'Admitted' })
    return items.map(studentOption)
  }

  if (key === 'all-books') {
    // Every title, for the edit flow — a retired one is exactly the title an
    // office may need to fix or put back on lending, so nothing is filtered.
    const books = await libraryService.books()
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
    const books = await libraryService.books()
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
    const { items } = await feesService.list({ limit: ALL, status: 1 })
    return items.map((fee) => ({ value: String(fee.id), label: fee.name }))
  }

  if (key === 'subjects') {
    // Withdrawn subjects are left out: a class cannot be taught one, and the
    // register keeps them only so old results still read.
    const { items } = await subjectsService.list({ limit: ALL, status: 1 })
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
    const subjects = await teachingService.subjects()
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
     * are class teacher of. A teacher given neither is offered nothing, which
     * is the truth: the office has not put them in front of a class yet.
     */
    const [subjects, profile] = await Promise.all([
      teachingService.subjects(),
      teachingService.profile(),
    ])
    const classes = new Map<number, { name: string; code: string }>()
    for (const one of [
      ...subjects.map((subject) => subject.department),
      ...profile.class_arms.map((arm) => arm.department),
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
    // enough of the roll to read them off.
    const { class_arms } = await teachingService.students({ limit: 1 })
    return class_arms.map((arm) => ({
      value: String(arm.id),
      label: arm.department?.name ? `${arm.department.name} · ${arm.arm_name}` : arm.arm_name,
    }))
  }

  if (key === 'sessions' || key === 'terms') {
    // Newest first for sessions, as the endpoint already sends them: a family
    // asking about a year is nearly always asking about this one or the last.
    const service = key === 'sessions' ? sessionsService : termsService
    const { items } = await service.list({ limit: ALL })
    return items.map((record) => ({ value: String(record.id), label: record.name }))
  }

  if (key === 'roles') {
    const roles = await usersService.roles()
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
    return methodOptions(await paymentMethods())
  }

  if (key === 'teachers') {
    const { items } = await teachersService.list({ limit: ALL })
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

  const parents = await parentsService.directory()
  return parents.map(guardianOption)
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
  })
}

async function searchFeed(key: SearchKey, term: string): Promise<Option[]> {
  if (key === 'guardians') {
    const { items } = await parentsService.list({ q: term || undefined, limit: 20 })
    return items.map(guardianOption)
  }
  if (key === 'students') {
    // The same register the `students` feed loads whole, narrowed server-side
    // by the name typed instead — for the flows where scrolling every admitted
    // student is worse than asking for the one being served.
    const { items } = await studentsService.list({
      q: term || undefined,
      limit: 20,
      status: 'Admitted',
    })
    return items.map(studentOption)
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
