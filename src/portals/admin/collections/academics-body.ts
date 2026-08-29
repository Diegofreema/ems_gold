import type { ClassArmBody, ClassArmStatus } from '../../../api/class-arms/types.ts'
import type { SubjectBody } from '../../../api/subjects/types.ts'

/** The form's values, all strings from the inputs and selects. */
export type FormValues = Record<string, unknown>

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function asId(value: unknown): number | undefined {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

/** The three words the API accepts; anything else it would default anyway. */
const STATUSES: readonly string[] = ['active', 'inactive', 'archived']

function asArmStatus(value: unknown): ClassArmStatus | undefined {
  const word = text(value)?.toLowerCase()
  return word && STATUSES.includes(word) ? (word as ClassArmStatus) : undefined
}

/**
 * The arm form as `POST /class-arms` wants it. An empty form teacher goes as
 * `''`, which the endpoint stores as null — leaving the key out instead would
 * keep whoever is already on the arm, so unassigning would be impossible.
 */
export function armBody(values: FormValues): ClassArmBody {
  return {
    arm_name: text(values.arm_name) ?? '',
    arm_description: text(values.arm_description),
    department_id: asId(values.department_id),
    class_teacher_id: asId(values.class_teacher_id) ?? '',
    status: asArmStatus(values.armstatus),
  }
}

/**
 * The subject form as `POST /subjects` wants it. The code is generated from
 * the name where the office leaves it empty, so it is dropped rather than sent
 * blank; the same is true of every other field on update.
 */
export function subjectBody(values: FormValues): SubjectBody {
  const credit = Number(text(values.creditload))
  return {
    name: text(values.name),
    subjectcode: text(values.subjectcode),
    department_id: asId(values.department_id),
    creditload: Number.isFinite(credit) && credit > 0 ? credit : undefined,
  }
}
