import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Book } from '../../api/library/types.ts'
import { canLend, freeCopies, lendingLabel } from './book-read.ts'

/** Bronze's own row, read 2026-09-16: 15 copies, one out, 14 free. */
const LIVE = {
  id: 1,
  title: 'General Maths',
  author: 'Dr Jame Oka',
  isavailable: 14,
  copies: 15,
} as unknown as Book

/** The shape the same endpoint sent on 2026-09-15 and before. */
const WORDED = { ...LIVE, isavailable: 'Available' } as unknown as Book
const RETIRED = { ...LIVE, isavailable: 'Unavailable' } as unknown as Book

test('the count is read as a count', () => {
  assert.equal(freeCopies(LIVE), 14)
  assert.equal(lendingLabel(LIVE), 'Available')
  assert.equal(canLend(LIVE), true)
})

test('no free copy is "All out", which is not the same as retired', () => {
  const out = { ...LIVE, isavailable: 0 } as unknown as Book
  assert.equal(freeCopies(out), 0)
  assert.equal(lendingLabel(out), 'All out')
  assert.equal(canLend(out), false)
})

test('the old word still reads as it always did', () => {
  // A deployment still on the old shape must not be broken by the fix to the
  // new one.
  assert.equal(freeCopies(WORDED), null)
  assert.equal(lendingLabel(WORDED), 'Available')
  assert.equal(canLend(WORDED), true)
  assert.equal(lendingLabel(RETIRED), 'Unavailable')
  assert.equal(canLend(RETIRED), false)
})

test('a word is never read as nought copies', () => {
  // `Number('Available')` is NaN, and NaN read as a count empties a shelf of
  // thirty.
  assert.equal(freeCopies(WORDED), null)
  assert.notEqual(lendingLabel(WORDED), 'All out')
})

test('a count sent as a string is still a count', () => {
  const stringy = { ...LIVE, isavailable: '3' } as unknown as Book
  assert.equal(freeCopies(stringy), 3)
  assert.equal(lendingLabel(stringy), 'Available')
})

test('a row that says nothing says so rather than guessing', () => {
  const empty = { ...LIVE, isavailable: null } as unknown as Book
  assert.equal(freeCopies(empty), null)
  assert.equal(lendingLabel(empty), 'Unknown')
  // Not refused: only the word "Unavailable" is a refusal, and this is not it.
  assert.equal(canLend(empty), true)
})
