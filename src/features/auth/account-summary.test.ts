import assert from 'node:assert/strict'
import { test } from 'node:test'
import { accountSummary } from './account-summary.ts'

/** The live /users/me payload, trimmed to what the summary reads. */
const admin = {
  user: { username: 'chukwudi.aniegboka@netpro.africa', fname: 'Chukwudi', lname: 'Aniegboka' },
  role: { id: 5, role_name: 'Super Admin' },
  profile_type: 'admin',
} as never

test('the sidebar names the person and the role the school gave them', () => {
  assert.deepEqual(accountSummary(admin), {
    name: 'Chukwudi Aniegboka',
    line: 'Super Admin',
    initials: 'CA',
  })
})

test('an account with no name on it still fills the square', () => {
  const bare = { user: { username: 'udoye2608264308', fname: '', lname: '' } } as never
  assert.deepEqual(accountSummary(bare), {
    name: 'udoye2608264308',
    line: 'udoye2608264308',
    initials: 'UD',
  })
})

test('one name is enough for both the label and the square', () => {
  const single = { user: { username: 'a.okeke', fname: 'Amara', lname: '' } } as never
  assert.equal(accountSummary(single).name, 'Amara')
  assert.equal(accountSummary(single).initials, 'A')
})
