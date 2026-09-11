import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  isReadableThread,
  threadMessages,
  threadStatus,
  threadSubject,
} from './thread.ts'

test('messages are found under any of the candidate keys', () => {
  for (const key of ['messages', 'conversation_messages', 'replies', 'items', 'posts']) {
    const read = threadMessages({ [key]: [{ body: 'Hello' }] }, undefined)
    assert.equal(read.length, 1, key)
    assert.equal(read[0].body, 'Hello', key)
  }
})

test('the body is read for whichever field carries it', () => {
  for (const key of ['body', 'message', 'content', 'text']) {
    const [only] = threadMessages({ messages: [{ [key]: 'Good afternoon' }] }, undefined)
    assert.equal(only.body, 'Good afternoon', key)
  }
})

test('a message written by the reader is theirs, and one by anybody else is not', () => {
  const [mine, theirs] = threadMessages(
    { messages: [{ user_id: 7, body: 'a' }, { user_id: 8, body: 'b' }] },
    7,
  )
  assert.equal(mine.mine, true)
  assert.equal(theirs.mine, false)
})

test('with no reader id nothing is claimed as the reader’s own', () => {
  const [only] = threadMessages({ messages: [{ user_id: 7, body: 'a' }] }, undefined)
  assert.equal(only.mine, false)
})

test('an expanded sender is read for its id and its name', () => {
  const [only] = threadMessages(
    { messages: [{ sender: { id: 12, name: 'Ada Obi' }, body: 'a' }] },
    12,
  )
  assert.equal(only.senderId, 12)
  assert.equal(only.senderName, 'Ada Obi')
  assert.equal(only.mine, true)
})

test('the order the server sent is the order kept', () => {
  const read = threadMessages(
    { messages: [{ id: 3, body: 'third' }, { id: 1, body: 'first' }] },
    undefined,
  )
  assert.deepEqual(read.map((row) => row.body), ['third', 'first'])
})

test('a row with no id still gets a stable key', () => {
  const read = threadMessages({ messages: [{ body: 'a' }, { body: 'b' }] }, undefined)
  assert.deepEqual(read.map((row) => row.key), ['row-0', 'row-1'])
})

test('a missing field reads as empty, never as the blank dash', () => {
  const [only] = threadMessages({ messages: [{ body: 'a' }] }, undefined)
  assert.equal(only.at, '')
  assert.equal(only.senderName, '')
})

test('a shape with no message array anywhere is not a readable thread', () => {
  assert.equal(isReadableThread({ conversation: { subject: 'x' } }), false)
  assert.equal(isReadableThread(undefined), false)
  assert.equal(isReadableThread({ messages: [] }), true)
  assert.deepEqual(threadMessages({ conversation: {} }, 1), [])
})

test('the subject and status fall back to what the inbox row already said', () => {
  assert.equal(threadSubject({ messages: [] }, 'fee payment'), 'fee payment')
  assert.equal(threadSubject({ subject: 'Homework' }, 'fee payment'), 'Homework')
  assert.equal(threadStatus({ messages: [] }, 'open'), 'open')
  assert.equal(threadStatus({ status: 'closed' }, 'open'), 'closed')
  assert.equal(threadStatus({ status: 'anything else' }, 'open'), 'open')
})
