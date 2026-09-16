import assert from 'node:assert/strict'
import { test } from 'node:test'
import { needsTheLoanId } from './return-route.ts'

/** The refusal bronze sent on 2026-09-16, word for word. */
const AMBIGUOUS = {
  status: 409,
  message:
    '2 copies of that title are out, to 2 pupils. Return the one that came back by its loan id: POST /api/admins/borrowed-books/{loanId}/return',
}

test('the refusal that asks for a loan id is recognised', () => {
  assert.equal(needsTheLoanId(AMBIGUOUS), true)
})

test('another 409 from the same endpoint keeps the school’s own words', () => {
  // A copy already back refuses with 409 too, and that sentence is one the
  // desk can act on — it must reach them rather than being rewritten.
  assert.equal(
    needsTheLoanId({ status: 409, message: 'That book is not currently on loan.' }),
    false,
  )
})

test('nothing else is mistaken for it', () => {
  assert.equal(needsTheLoanId({ status: 404, message: 'by its loan id' }), false)
  assert.equal(needsTheLoanId(new Error('loan id')), false)
  assert.equal(needsTheLoanId(null), false)
  assert.equal(needsTheLoanId(undefined), false)
  assert.equal(needsTheLoanId('409'), false)
})
