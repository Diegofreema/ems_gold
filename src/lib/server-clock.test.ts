import assert from 'node:assert/strict'
import { test } from 'node:test'
import { noteServerTime, serverNow } from './server-clock.ts'

/** Within a second of each other, which is all the `Date` header resolves to. */
function near(actual: number, expected: number, slack = 1500) {
  assert.ok(
    Math.abs(actual - expected) < slack,
    `${actual} is not within ${slack}ms of ${expected}`,
  )
}

test('the clock follows the school, not the device', () => {
  const ahead = Date.now() + 10 * 60 * 1000
  noteServerTime(new Date(ahead).toUTCString())
  near(serverNow(), ahead)
})

test('a response with no usable date leaves the anchor where it was', () => {
  const ahead = Date.now() + 10 * 60 * 1000
  noteServerTime(new Date(ahead).toUTCString())

  noteServerTime(null)
  noteServerTime('')
  noteServerTime('sometime on Tuesday')
  near(serverNow(), ahead)
})

test('the next answer re-anchors it', () => {
  noteServerTime(new Date(Date.now() + 10 * 60 * 1000).toUTCString())
  noteServerTime(new Date().toUTCString())
  near(serverNow(), Date.now())
})
