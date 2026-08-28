import { queryOptions } from '@tanstack/react-query'
import { classArmsService } from '@/api/class-arms/service'
import { departmentsService } from '@/api/departments/service'
import { parentsService } from '@/api/parents/service'
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

  const parents = await parentsService.directory()
  return parents.map((parent) => ({
    value: String(parent.id),
    label:
      [parent.fathersname, parent.mothersname].filter(Boolean).join(' & ') ||
      parent.pemailaddress ||
      `Guardian ${parent.id}`,
  }))
}
