import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Notice } from '../../api/notifications/types.ts'
import {
  mergedFeed,
  noticeFeed,
  noticeGroup,
  noticeMeta,
  noticeWhen,
} from './notice-feed.ts'
import type { Notification } from './types.ts'

/** `GET /notifications/mine` as teacher1 on bronze, notice 31 in full. */
const RESUMPTION: Notice = {
  id: 31,
  title: 'School Resumtion',
  message:
    'This is to inform all thatschool resumes on the 8th of September 2026. All fees are to tbe paid in full before resumption',
  datecreated: '2026-09-01T11:14:47+01:00',
  user_id: 1,
  recipients: 'all',
  status: 'active',
  viewcount: 0,
  is_read: false,
  is_automatic: false,
  scope: 'school',
  class_name: null,
  posted_by: 'Chukwudi Aniegboka',
}

/** The older one, which only the pupil is served. */
const TEST_NOTE: Notice = {
  ...RESUMPTION,
  id: 1,
  title: 'test note',
  message: 'testing notes',
  datecreated: '2026-08-12T09:43:12+01:00',
  recipients: 'students',
  viewcount: 2,
}

const NOW = new Date(2026, 8, 1, 14, 30)

test('a notice becomes a feed item that leads nowhere', () => {
  const [item] = noticeFeed([RESUMPTION], NOW)
  assert.equal(item.id, 'notice-31')
  assert.equal(item.noticeId, 31)
  assert.equal(item.kicker, 'Notice')
  assert.equal(item.title, 'School Resumtion')
  assert.match(item.body, /^This is to inform all/)
  assert.equal(item.meta, 'Chukwudi Aniegboka · Whole school')
  assert.equal(item.group, 'Today')
  assert.equal(item.when, '11:14')
  assert.equal(item.read, false)
  // The notice is the content; there is no page behind it.
  assert.equal(item.to, undefined)
})

test('the school’s own offset is dropped rather than believed', () => {
  // Same wall clock however the stamp is written: 11:14 is 11:14 at the school.
  const bare = noticeFeed([{ ...RESUMPTION, datecreated: '2026-09-01 11:14:47' }], NOW)
  const utc = noticeFeed([{ ...RESUMPTION, datecreated: '2026-09-01T11:14:47+00:00' }], NOW)
  assert.equal(bare[0].when, '11:14')
  assert.equal(utc[0].when, '11:14')
})

test('the meta line says who posted it and how far it reached', () => {
  assert.equal(noticeMeta(RESUMPTION), 'Chukwudi Aniegboka · Whole school')
  assert.equal(
    noticeMeta({ ...RESUMPTION, scope: 'class', class_name: 'JSS 1' }),
    'Chukwudi Aniegboka · JSS 1',
  )
  // A class notice that did not name its class still says it is not everyone's.
  assert.equal(
    noticeMeta({ ...RESUMPTION, scope: 'class', class_name: null }),
    'Chukwudi Aniegboka · One class',
  )
  // A paper being set raises one of these; nobody wrote it.
  assert.equal(
    noticeMeta({ ...RESUMPTION, is_automatic: true }),
    'Posted automatically · Whole school',
  )
  assert.equal(noticeMeta({ ...RESUMPTION, posted_by: '  ' }), 'Whole school')
})

test('an empty title or message still reads as something', () => {
  const [item] = noticeFeed([{ ...RESUMPTION, title: '   ', message: null }], NOW)
  assert.equal(item.title, 'Untitled notice')
  assert.match(item.body, /no message/)
})

test('the board sends `active`, and anything else is withdrawn', () => {
  assert.equal(noticeFeed([RESUMPTION], NOW).length, 1)
  // Nothing has ever come back saying this — it drops one if the day comes.
  assert.deepEqual(noticeFeed([{ ...RESUMPTION, status: 'expired' }], NOW), [])
  // No status at all is not a reason to hide a notice.
  assert.equal(noticeFeed([{ ...RESUMPTION, status: null }], NOW).length, 1)
})

test('a notice with no readable date has no place in a feed ordered by time', () => {
  assert.deepEqual(noticeFeed([{ ...RESUMPTION, datecreated: null }], NOW), [])
  assert.deepEqual(noticeFeed([{ ...RESUMPTION, datecreated: 'sometime' }], NOW), [])
})

test('the pupil’s two notices come back newest first', () => {
  const items = noticeFeed([TEST_NOTE, RESUMPTION], NOW)
  assert.deepEqual(
    items.map((item) => [item.noticeId, item.group, item.when]),
    [
      [31, 'Today', '11:14'],
      [1, 'Earlier', '12 Aug'],
    ],
  )
})

test('an older year is said out loud', () => {
  assert.equal(noticeWhen(new Date(2025, 10, 18, 9, 0).getTime(), NOW), '18 Nov 2025')
  assert.equal(noticeGroup(NOW.getTime(), NOW), 'Today')
})

test('two feeds merge into one order, and an undated item sinks', () => {
  const derived: Notification[] = [
    {
      id: 'mark-1',
      kicker: 'Assessment',
      title: 'Marks approved',
      body: '',
      when: '',
      group: 'Today',
      at: new Date(2026, 8, 1, 12, 0).getTime(),
    },
    { id: 'fixture', kicker: 'School', title: 'No stamp', body: '', when: '', group: 'Earlier' },
  ]
  assert.deepEqual(
    mergedFeed(derived, noticeFeed([RESUMPTION], NOW)).map((item) => item.id),
    // The mark's noon beats the notice's 11:14, and the item with no stamp
    // sinks to the end rather than heading a feed it has no place in.
    ['mark-1', 'notice-31', 'fixture'],
  )
})
