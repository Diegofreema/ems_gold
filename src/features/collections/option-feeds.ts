import { queryOptions } from '@tanstack/react-query'
import { classArmsService } from '@/api/class-arms/service'
import { departmentsService } from '@/api/departments/service'
import { parentsService } from '@/api/parents/service'
import { teachersService } from '@/api/teachers/service'
import { queryClient } from '@/lib/query-client'
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
    return arms.map((arm) => ({ value: String(arm.id), label: arm.arm_name }))
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
