import assert from 'node:assert/strict'
import { test } from 'node:test'
import { schemaFromSections } from './schema.ts'

const sections = [
  {
    title: 'Details',
    fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'amount', label: 'Amount', required: true, numeric: true },
      { key: 'email', label: 'Email', email: true },
      { key: 'note', label: 'Note' },
    ],
  },
]

const schema = schemaFromSections(sections)

test('required fields reject blank and whitespace-only input', () => {
  const result = schema.safeParse({ name: '   ', amount: '100' })
  assert.equal(result.success, false)
  assert.equal(result.error?.issues.some((i) => i.path[0] === 'name'), true)
})

test('numeric fields accept the separators the design allows', () => {
  assert.equal(schema.safeParse({ name: 'Boarding', amount: '120,000.50' }).success, true)
  assert.equal(schema.safeParse({ name: 'Boarding', amount: '12k' }).success, false)
})

test('optional email is skipped when empty but checked when filled', () => {
  assert.equal(schema.safeParse({ name: 'A', amount: '1' }).success, true)
  assert.equal(schema.safeParse({ name: 'A', amount: '1', email: 'nope' }).success, false)
  assert.equal(schema.safeParse({ name: 'A', amount: '1', email: 'a@b.ng' }).success, true)
})
