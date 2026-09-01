import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { ActivityLog } from '../../../../api/logs/types.ts'
import { adminNotices } from './notices.ts'

/** `GET /logs?limit=6` on bronze, read 2026-09-01. */
const NOTICE_POSTED: ActivityLog = {
  id: 437,
  title: 'Posted a notice',
  description: 'School Resumtion (to all)',
  type: 'Add',
  ip: '135.129.124.49',
  timestamp: '2026-09-01T11:14:47+01:00',
  user_id: 1,
  user: 'Chukwudi Aniegboka',
  username: 'chukwudi.aniegboka@netpro.africa',
}

const API_LOGIN: ActivityLog = {
  id: 439,
  title: 'API login',
  description: 'Signed in through the API',
  type: 'Login',
  ip: '135.129.124.49',
  timestamp: '2026-09-01T11:41:02+01:00',
  user_id: 487,
  user: 'Surname Firstname',
  username: 'admin1@netpro.africa',
}

const NOW = new Date(2026, 8, 1, 14, 30)

test('an audit entry becomes a feed item that opens the log', () => {
  const [item] = adminNotices([NOTICE_POSTED], NOW)
  assert.equal(item.id, 'log-437')
  assert.equal(item.kicker, 'Records')
  assert.equal(item.title, 'Posted a notice')
  // The trail's own sentence, not the portal's.
  assert.equal(item.body, 'School Resumtion (to all)')
  assert.equal(item.meta, 'Chukwudi Aniegboka')
  assert.equal(item.when, '11:14')
  assert.equal(item.group, 'Today')
  assert.equal(item.to, '/admin/logs')
})

test('sign-ins are left off — they are most of the trail and none of the news', () => {
  assert.deepEqual(adminNotices([API_LOGIN], NOW), [])
  assert.deepEqual(
    adminNotices([API_LOGIN, NOTICE_POSTED], NOW).map((item) => item.id),
    ['log-437'],
  )
})

test('a deletion is tagged apart, so it can be filtered to', () => {
  const deleted: ActivityLog = {
    ...NOTICE_POSTED,
    id: 440,
    title: 'Deleted an invoice',
    type: 'Delete',
  }
  assert.equal(adminNotices([deleted], NOW)[0].kicker, 'Deletion')
  assert.equal(adminNotices([{ ...NOTICE_POSTED, type: 'Edit' }], NOW)[0].kicker, 'Records')
})

test('an entry whose account has gone is still attributed', () => {
  const orphan = { ...NOTICE_POSTED, user: null, username: null }
  assert.equal(adminNotices([orphan], NOW)[0].meta, 'User 1')
  assert.equal(adminNotices([{ ...orphan, user_id: null }], NOW)[0].meta, 'Deleted account')
})

test('an entry with nothing written in it still reads as something', () => {
  const bare = { ...NOTICE_POSTED, title: '   ', description: '' }
  const [item] = adminNotices([bare], NOW)
  assert.equal(item.title, 'Something changed')
  assert.match(item.body, /no detail/)
})

test('an entry with no readable time has no place in a feed ordered by it', () => {
  assert.deepEqual(adminNotices([{ ...NOTICE_POSTED, timestamp: '' }], NOW), [])
})

test('the trail comes back newest first whatever order it arrived in', () => {
  const older = { ...NOTICE_POSTED, id: 400, timestamp: '2026-08-20T08:00:00+01:00' }
  assert.deepEqual(
    adminNotices([older, NOTICE_POSTED], NOW).map((item) => [item.id, item.when]),
    [
      ['log-437', '11:14'],
      ['log-400', '20 Aug'],
    ],
  )
})
