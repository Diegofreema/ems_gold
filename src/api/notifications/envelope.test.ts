import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Notice, NoticeEnvelope } from './types.ts'
import { countIn, noticeIn, noticesIn } from './envelope.ts'

const NOTICE = { id: 12, title: 'Mid-term break' } as Notice

test('the list is found whatever key the server puts it under', () => {
  // `notifications` is the guess; none of these has been seen live.
  assert.deepEqual(noticesIn({ notifications: [NOTICE] }), [NOTICE])
  assert.deepEqual(noticesIn({ notices: [NOTICE] } as NoticeEnvelope), [NOTICE])
  assert.deepEqual(noticesIn([NOTICE]), [NOTICE])
})

test('a pagination block beside the list is not mistaken for it', () => {
  const envelope = { pagination: { page: 1, limit: 25, total: 1, pages: 1 }, notifications: [NOTICE] }
  assert.deepEqual(noticesIn(envelope as NoticeEnvelope), [NOTICE])
})

test('an answer with no list reads empty rather than throwing', () => {
  assert.deepEqual(noticesIn(undefined), [])
  assert.deepEqual(noticesIn({}), [])
  assert.deepEqual(noticesIn({ message: 'Nothing for you' } as NoticeEnvelope), [])
})

test('one notice is found wrapped or bare', () => {
  assert.equal(noticeIn({ notification: NOTICE } as NoticeEnvelope), NOTICE)
  assert.equal(noticeIn(NOTICE as NoticeEnvelope), NOTICE)
  assert.equal(noticeIn(undefined), undefined)
  // A record without an id is not a record.
  assert.equal(noticeIn({ notification: { title: 'x' } } as NoticeEnvelope), undefined)
})

test('the badge number is read by shape, and is 0 where there is none', () => {
  assert.equal(countIn({ count: 3 }), 3)
  assert.equal(countIn({ unread_count: 3 }), 3)
  assert.equal(countIn(3), 3)
  assert.equal(countIn(0), 0)
  // Safe direction to be wrong in: no badge beats an invented one.
  assert.equal(countIn({}), 0)
  assert.equal(countIn(null), 0)
  assert.equal(countIn('3'), 0)
})
