import type { CreateStaffBody, UpdateStaffBody } from '../../../api/teachers/types.ts'
import type { CreateAdminBody, UpdateAdminRecordBody } from '../../../api/admins/types.ts'

/** The form's values, all strings from the inputs and selects. */
export type FormValues = Record<string, unknown>

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function asId(value: unknown): number | undefined {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

/**
 * What both endpoints ask for in the same words. Fields left empty are dropped
 * rather than sent blank, so editing one section never clears another.
 */
function common(values: FormValues) {
  return {
    middlename: text(values.middlename),
    gender: text(values.gender),
    address: text(values.address),
    phone: text(values.phone),
    department_id: asId(values.department_id),
  }
}

/**
 * The staff form as `POST /teachers` wants it. The username is the login being
 * created alongside the record, so it is only sent when there is no record yet
 * — `PATCH`ing it would rename somebody's sign-in.
 */
export function teacherBody(values: FormValues): CreateStaffBody {
  return {
    ...common(values),
    username: text(values.username) ?? '',
    firstname: text(values.firstname) ?? '',
    lastname: text(values.lastname) ?? '',
    qualification: text(values.qualification),
  }
}

export function teacherUpdate(values: FormValues): UpdateStaffBody {
  const { username: _username, ...body } = teacherBody(values)
  return body
}

/**
 * The same form as `POST /admins/new-admin` wants it. This endpoint calls the
 * first half of the name `surname`, so the form's `firstname` goes there.
 */
export function adminBody(values: FormValues): CreateAdminBody {
  return {
    ...common(values),
    username: text(values.username) ?? '',
    surname: text(values.firstname) ?? '',
    lastname: text(values.lastname) ?? '',
  }
}

export function adminUpdate(values: FormValues): UpdateAdminRecordBody {
  const { username: _username, ...body } = adminBody(values)
  return body
}
