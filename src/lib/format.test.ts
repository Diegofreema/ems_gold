import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseNaira } from './format.ts'

test('reads the figure out of a display string', () => {
  assert.equal(parseNaira('₦120,000'), 120_000)
  assert.equal(parseNaira('₦0'), 0)
  assert.equal(parseNaira('—'), 0)
})
