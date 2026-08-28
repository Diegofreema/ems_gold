import assert from 'node:assert/strict'
import test from 'node:test'
import { buildUrl, paginated } from './url.ts'

const BASE = 'https://bronze.uaes.education/api'

test('the base url keeps its path segment', () => {
  assert.equal(buildUrl(BASE, 'users/login'), `${BASE}/users/login`)
  assert.equal(buildUrl(`${BASE}/`, '/users/login'), `${BASE}/users/login`)
})

test('an empty filter is left off rather than sent blank', () => {
  const url = buildUrl(BASE, 'students', {
    q: 'udo',
    status: '',
    department_id: undefined,
    class_arm_id: null,
    page: 1,
  })
  assert.equal(url, `${BASE}/students?q=udo&page=1`)
})

test('zero and false are real filter values, not empties', () => {
  assert.equal(buildUrl(BASE, 'fees', { status: 0, force: false }), `${BASE}/fees?status=0&force=false`)
})

test('a list is narrowed to items and its pagination', () => {
  const result = paginated<{ id: number }>(
    { invoices: [{ id: 1 }], pagination: { page: 2, limit: 50, total: 60, pages: 2 } },
    'invoices',
  )
  assert.deepEqual(result.items, [{ id: 1 }])
  assert.equal(result.pagination.page, 2)
})

test('an unpaged endpoint reads as a single full page', () => {
  const result = paginated<number>({ books: [1, 2, 3] }, 'books')
  assert.deepEqual(result.pagination, { page: 1, limit: 3, total: 3, pages: 1 })
})

test('a missing list is empty rather than undefined', () => {
  assert.deepEqual(paginated({}, 'students').items, [])
})
