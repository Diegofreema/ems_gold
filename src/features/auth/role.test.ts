import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isSuperAdmin, isSuperAdminRole } from './role.ts'

const account = (role: { id: number; role_name: string } | null) =>
  ({ user: { fname: 'Ada', lname: 'Obi', username: 'ada' }, role }) as never

test('the super administrator is told apart from the rest of the office', () => {
  assert.ok(isSuperAdmin(account({ id: 5, role_name: 'Super Admin' })))
  // Renamed on the school's own server, but still the system role.
  assert.ok(isSuperAdmin(account({ id: 5, role_name: 'Principal' })))
  // Named for it under another id, which is how a school adds a second one.
  assert.ok(isSuperAdmin(account({ id: 12, role_name: 'super admin' })))
})

test('everyone else in the office is not one', () => {
  assert.ok(!isSuperAdmin(account({ id: 7, role_name: 'Bursar' })))
  assert.ok(!isSuperAdmin(account({ id: 1, role_name: 'Admin' })))
  assert.ok(!isSuperAdmin(account({ id: 6, role_name: 'Secretary' })))
  // No role on the account at all, and no account: neither is a yes.
  assert.ok(!isSuperAdmin(account(null)))
  assert.ok(!isSuperAdmin(null))
})

test('a role read off a record answers the same as one off the session', () => {
  // The register carries the role by name and nothing else, which is all the
  // record page has to go on when it decides whether to offer the flow.
  assert.ok(isSuperAdminRole('Super Admin'))
  assert.ok(isSuperAdminRole('super admin'))
  assert.ok(!isSuperAdminRole('Bursar'))
  // The register's own fallback when the roles feed failed: not a claim that
  // this account is a super administrator.
  assert.ok(!isSuperAdminRole('Administrator'))
  assert.ok(!isSuperAdminRole(undefined))
})
