import assert from 'node:assert/strict'
import { test } from 'node:test'
import { QueryClient } from '@tanstack/react-query'
import { dropDerivedReads } from './invalidate.ts'

/**
 * The keys the app actually reads derived data under. Written out in full
 * rather than imported, so that moving one of them without moving the
 * invalidation fails here instead of on somebody's screen.
 */
const READ_UNDER = {
  rows: ['collection', '/admin/students', '', { page: 1 }],
  tiles: ['collection', '/admin/students', 'summary'],
  otherRegister: ['collection', '/teacher/assignments', '', { page: 1 }],
  modal: ['record-modal', 'students', '', '4'],
  tab: ['detail-tab', 'Fees', '4'],
  options: ['options', 'classes', ''],
  search: ['search', 'students', 'ade'],
  adminHome: ['admin', 'dashboard'],
  teacherHome: ['teaching', 'dashboard'],
  studentHome: ['my-schooling', 'dashboard'],
  family: ['parent', 'family', '12'],
}

function seeded() {
  const client = new QueryClient()
  for (const key of Object.values(READ_UNDER)) client.setQueryData(key, 'as it was')
  // A domain's own answer. Its hook says when it changes; this is not that.
  client.setQueryData(['students', 'detail', '4'], 'as it was')
  return client
}

const stale = (client: QueryClient, key: readonly unknown[]) =>
  client.getQueryState(key)?.isInvalidated === true

test('a write drops every key derived data is read under', async () => {
  const client = seeded()
  await dropDerivedReads(client)

  for (const [where, key] of Object.entries(READ_UNDER)) {
    assert.ok(stale(client, key), `${where} was left holding what used to be true`)
  }
})

test('the record dialog goes with the register it sits over', async () => {
  // The one that was actually broken: the register refreshed underneath and
  // the record on top of it kept the values the edit had just replaced.
  const client = seeded()
  await dropDerivedReads(client)
  assert.ok(stale(client, READ_UNDER.modal))
})

test('a register built on another portal’s endpoint goes too', async () => {
  // A teacher writing the first question of an assignment updates
  // `['set-assignments']`, and the register that reads "No questions" is a
  // collection — which is why this is not left to the domain hook.
  const client = seeded()
  await dropDerivedReads(client)
  assert.ok(stale(client, READ_UNDER.otherRegister))
})

test('a domain’s own answer is left to its own hook', async () => {
  const client = seeded()
  await dropDerivedReads(client)
  assert.equal(stale(client, ['students', 'detail', '4']), false)
})
