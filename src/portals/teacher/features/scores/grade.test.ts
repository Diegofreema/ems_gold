import assert from 'node:assert/strict'
import { test } from 'node:test'
import { gradeFor, markOf, sheetAverage, totalOf } from './grade.ts'

test('grade bands match the design', () => {
  assert.equal(gradeFor(100), 'A')
  assert.equal(gradeFor(75), 'A')
  assert.equal(gradeFor(74), 'B')
  assert.equal(gradeFor(65), 'B')
  assert.equal(gradeFor(64), 'C')
  assert.equal(gradeFor(55), 'C')
  assert.equal(gradeFor(54), 'D')
  assert.equal(gradeFor(45), 'D')
  assert.equal(gradeFor(44), 'E')
  assert.equal(gradeFor(40), 'E')
  assert.equal(gradeFor(39), 'F')
  assert.equal(gradeFor(0), 'F')
})

test('blank and junk marks count as zero', () => {
  assert.equal(markOf(''), 0)
  assert.equal(markOf('abc'), 0)
  assert.equal(markOf('26'), 26)
  assert.equal(totalOf('26', '52'), 78)
  assert.equal(totalOf('', '43'), 43)
})

test('sheet average rounds to a whole mark', () => {
  assert.equal(sheetAverage([]), 0)
  assert.equal(sheetAverage([78, 82, 74]), 78)
  assert.equal(sheetAverage([70, 71]), 71)
})
