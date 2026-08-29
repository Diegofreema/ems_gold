import { queryOptions } from '@tanstack/react-query'
import { classArmsService } from '@/api/class-arms/service'
import { paymentMethods } from '@/api/collect-fees/hooks'
import { departmentsService } from '@/api/departments/service'
import { feesService } from '@/api/fees/service'
import { parentsService } from '@/api/parents/service'
import { studentsService } from '@/api/students/service'
import { subjectsService } from '@/api/subjects/service'
import { teachersService } from '@/api/teachers/service'
import { queryClient } from '@/lib/query-client'
import { methodOptions } from '@/portals/admin/collections/collect-row'
import { guardianOption } from './guardian-option'
import type { Option, OptionsKey } from './options'

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
    return items.map((department) => ({
      value: String(department.id),
      label: department.name,
    }))
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

  if (key === 'students') {
    const { items } = await studentsService.list({ limit: ALL, status: 'Admitted' })
    return items.map((student) => ({
      value: String(student.id),
      // The admission number is what an office bills against, so it is offered
      // beside the name rather than instead of it.
      label: [
        [student.fname, student.mname, student.lname].filter(Boolean).join(' ').trim(),
        student.regno,
      ]
        .filter(Boolean)
        .join(' · ') || `Pupil ${student.id}`,
    }))
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

  if (key === 'payment-methods') {
    // Named by the API rather than listed here, so a school that stops
    // taking cheques stops being offered cheque.
    return methodOptions(await paymentMethods())
  }

  if (key === 'teachers') {
    const { items } = await teachersService.list({ limit: ALL })
    return items.map((teacher) => ({
      value: String(teacher.id),
      label: [teacher.firstname, teacher.lastname].filter(Boolean).join(' ').trim() ||
        `Teacher ${teacher.id}`,
    }))
  }

  const parents = await parentsService.directory()
  return parents.map(guardianOption)
}

/**
 * A feed as a lookup from id to label, for a register that holds a foreign key
 * the list endpoint does not expand — a pupil's guardian, an arm's class. It
 * reads the same cache the forms' selects do, so asking for it costs a request
 * only when nothing has needed that feed for five minutes, and a feed that
 * fails leaves the column falling back rather than the page failing with it.
 */
export async function optionLabels(
  key: OptionsKey,
  dependsOn = '',
): Promise<ReadonlyMap<string, string>> {
  const options = await queryClient
    .ensureQueryData(optionsQuery(key, dependsOn))
    .catch(() => [])
  return new Map(options.map((option) => [option.value, option.label]))
}
