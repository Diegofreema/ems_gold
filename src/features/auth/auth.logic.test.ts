import assert from 'node:assert/strict'
import { test } from 'node:test'
import { MINIMUM_SCORE, passwordScore, strengthLabel } from './password.ts'
import { roleForEmail } from './role.ts'

test('the account, not the person, decides the portal', () => {
  assert.equal(roleForEmail('bursary@netpro.ng'), 'Admin')
  assert.equal(roleForEmail('office.desk@netpro.ng'), 'Admin')
  assert.equal(roleForEmail('guardian@netpro.ng'), 'Parent')
  assert.equal(roleForEmail('a.okeke@pupils.netpro.ng'), 'Student')
  assert.equal(roleForEmail('c.nnaji@netpro.ng'), 'Teacher')
})

test('length can never be traded away for other rules', () => {
  // Upper+lower, a number and a symbol, but only nine characters.
  assert.equal(passwordScore('Ab1!efghi'), 1)
  assert.ok(passwordScore('Ab1!efghij') >= MINIMUM_SCORE)
})

test('strength wording tracks the score', () => {
  assert.equal(strengthLabel(''), 'Nothing typed yet')
  assert.equal(strengthLabel('short'), 'Too short to accept')
  assert.equal(strengthLabel('Abcdefghij1!'), 'Strong')
})
