import type { Account } from '../../api/auth/types.ts'
import type { Admin, UpdateProfileBody } from '../../api/users/types.ts'

/**
 * The admin record spells the two halves of a name `surname` and `lastname`,
 * and the words alone do not say which is the family name. The same person is
 * on the account as `fname`/`lname`, so the pairing is read off the record
 * rather than guessed — and only falls back to the literal reading when the
 * record gives nothing to compare against.
 */
function nameFields(account: Account, first: string, family: string) {
  const record = account.profile_type === 'admin' ? (account.profile as Admin | undefined) : undefined

  if (record?.surname && record.surname === account.user.fname) {
    return { surname: first, lastname: family }
  }
  return { surname: family, lastname: first }
}

/** Everything after the first word is the family name, so double-barrels survive. */
function splitName(fullname: string): [first: string, family: string] {
  const [first = '', ...rest] = fullname.trim().split(/\s+/)
  return [first, rest.join(' ')]
}

/**
 * The profile form as `PATCH /users/profile` wants it.
 *
 * Only the keys the endpoint accepts are sent — a staff number, a work email
 * and an office are held elsewhere, and the form still shows them. Keys the
 * portal never rendered come out `undefined` and are dropped by `toFormData`,
 * so a partial form can never blank a field it did not show.
 */
export function profileBody(
  values: Record<string, unknown>,
  account: Account,
): UpdateProfileBody {
  const text = (key: string) =>
    typeof values[key] === 'string' ? (values[key] as string).trim() : undefined

  const fullname = text('fullname')

  return {
    ...(fullname ? nameFields(account, ...splitName(fullname)) : {}),
    phone: text('phone'),
    address: text('address'),
  }
}
