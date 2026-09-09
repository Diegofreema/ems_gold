import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ApiError } from '../api/client.ts'
import { backoffFor, classify } from './classify.ts'
import { OfflineError } from './errors.ts'

test('a connection that was never there is worth trying again', () => {
  assert.equal(classify(new OfflineError('parent.children')), 'retryable')
  assert.equal(classify(new TypeError('Failed to fetch')), 'retryable')
})

test('a refused token stops the queue rather than failing the work in it', () => {
  assert.equal(classify(new ApiError(401, 'Unauthenticated.')), 'auth')
  assert.equal(classify(new ApiError(403, 'This endpoint is restricted to administrators.')), 'auth')
})

test('the school being unwell is temporary; the school saying no is not', () => {
  for (const status of [408, 425, 429, 500, 502, 503, 504]) {
    assert.equal(classify(new ApiError(status, 'later')), 'retryable', `${status} should be retryable`)
  }
  for (const status of [400, 404, 409, 422]) {
    assert.equal(classify(new ApiError(status, 'no')), 'terminal', `${status} should be terminal`)
  }
})

test('a failure with no story to tell is not replayed forever', () => {
  assert.equal(classify(new Error('something')), 'terminal')
  assert.equal(classify('a string'), 'terminal')
  assert.equal(classify(undefined), 'terminal')
})

test('backoff climbs and then holds, so a device in a corridor keeps asking', () => {
  assert.equal(backoffFor(0), 1_000)
  assert.equal(backoffFor(1), 4_000)
  assert.equal(backoffFor(4), 300_000)
  assert.equal(backoffFor(40), 300_000)
  // A negative count is nonsense, but it must not read as "wait forever".
  assert.equal(backoffFor(-1), 1_000)
})
