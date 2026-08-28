import assert from 'node:assert/strict'
import { test } from 'node:test'
import { profileBody } from './to-body.ts'

const account = (surname: string) =>
  ({
    user: { fname: 'Chukwudi', lname: 'Aniegboka' },
    profile_type: 'admin',
    profile: { surname },
  }) as never

test('the name halves are paired the way the record itself pairs them', () => {
  // This record calls the family name the surname.
  assert.deepEqual(
    profileBody({ fullname: 'Chukwudi Aniegboka' }, account('Aniegboka')),
    { surname: 'Aniegboka', lastname: 'Chukwudi', phone: undefined, address: undefined },
  )

  // This one calls the given name the surname, so the halves go the other way.
  assert.deepEqual(
    profileBody({ fullname: 'Chukwudi Aniegboka' }, account('Chukwudi')),
    { surname: 'Chukwudi', lastname: 'Aniegboka', phone: undefined, address: undefined },
  )
})

test('everything after the first word stays with the family name', () => {
  const body = profileBody({ fullname: 'Ada Nwosu Okafor' }, account('Aniegboka'))
  assert.equal(body.surname, 'Nwosu Okafor')
  assert.equal(body.lastname, 'Ada')
})

test('a field the portal never showed is left out rather than blanked', () => {
  const body = profileBody({ fullname: 'Ada Okafor', phone: '0803' }, account('Aniegboka'))
  assert.equal(body.address, undefined)
  assert.equal(body.phone, '0803')
})

test('the keys the endpoint has no home for never reach it', () => {
  const body = profileBody(
    { fullname: 'Ada Okafor', email: 'a@b.ng', staffno: 'STF-003', office: 'Block A' },
    account('Aniegboka'),
  )
  assert.deepEqual(Object.keys(body).sort(), ['address', 'lastname', 'phone', 'surname'])
})
