import assert from 'node:assert/strict'
import { test } from 'node:test'
import { syncMessage } from './message.ts'

const state = (over: Partial<Parameters<typeof syncMessage>[0]> = {}) =>
  syncMessage({ online: true, durable: true, waiting: 0, needsAnswer: 0, ...over })

test('offline with a durable device promises the send, because it can keep it', () => {
  const said = state({ online: false, waiting: 3 })
  assert.match(said, /saved on this device/)
  assert.match(said, /3 changes are/)
})

test('offline with nowhere to store it promises nothing of the kind', () => {
  const said = state({ online: false, durable: false, waiting: 2 })
  assert.match(said, /cannot save work between visits/)
  assert.match(said, /Keep this tab open/)
  // The old copy's promise must not survive anywhere in this branch.
  assert.doesNotMatch(said, /will send when the connection returns/)
})

test('a browser that cannot store warns before anything is typed, not after', () => {
  const said = state({ online: false, durable: false })
  assert.match(said, /lost if you close this tab/)
})

test('anything needing a person outranks everything else', () => {
  const said = state({ online: false, durable: false, waiting: 9, needsAnswer: 1 })
  assert.equal(said, '1 change needs your attention before it can be saved to the school.')
})

test('connected and waiting says only what it knows: the device is trying', () => {
  // Not "to the school". The device has it and is trying; where the trying is
  // what has gone wrong, naming the school reads as a delivery this sentence
  // cannot promise.
  assert.equal(state({ waiting: 1 }), '1 change is still being sent.')
  assert.equal(state({ waiting: 4 }), '4 changes are still being sent.')
})

test('one reads as one and two read as two', () => {
  assert.match(state({ needsAnswer: 2 }), /^2 changes need your attention before they can/)
  assert.match(state({ online: false, waiting: 1 }), /1 change is saved on this device/)
})
