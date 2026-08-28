import assert from 'node:assert/strict'
import { test } from 'node:test'
import { rateFor, standingFor } from './attendance.ts'

test('standing bands are inclusive at their boundaries', () => {
  assert.equal(standingFor(100), 'Good')
  assert.equal(standingFor(95), 'Good')
  assert.equal(standingFor(94), 'Watch')
  assert.equal(standingFor(85), 'Watch')
  assert.equal(standingFor(84), 'Poor')
})

test('rate rounds and never divides by zero', () => {
  assert.equal(rateFor({ open: 46, present: 45 }), 98)
  assert.equal(rateFor({ open: 46, present: 33 }), 72)
  assert.equal(rateFor({ open: 0, present: 0 }), 0)
})
