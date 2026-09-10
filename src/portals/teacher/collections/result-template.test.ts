import assert from 'node:assert/strict'
import { test } from 'node:test'
import { RESULT_COLUMNS, resultTemplate, templateName } from './result-template.ts'

/**
 * The headings are taken from the sheet the school actually accepts
 * (`result_format_new1.xlsx`), in that order. The parser reads by position, so
 * this test is the contract: change the order and a class's exam marks land in
 * the CA column.
 */
test('the columns are the ones the office parses, in order', () => {
  assert.deepEqual(
    [...RESULT_COLUMNS],
    ['Registration Number', 'CA', '1st Exam', '2nd Exam', '3rd Exam'],
  )
})

test('the heading row comes first, whatever the roll holds', () => {
  const [heading] = resultTemplate([]).split('\r\n')
  assert.equal(heading, 'Registration Number,CA,1st Exam,2nd Exam,3rd Exam')
})

test('an empty roll is still a usable template', () => {
  assert.equal(resultTemplate([]), 'Registration Number,CA,1st Exam,2nd Exam,3rd Exam\r\n')
})

test('every student gets a row, with the four mark cells left empty', () => {
  const lines = resultTemplate(['NETPRO/2026/2', 'NETPRO/2026/3']).trimEnd().split('\r\n')
  assert.equal(lines.length, 3)
  assert.equal(lines[1], 'NETPRO/2026/2,,,,')
  assert.equal(lines[2], 'NETPRO/2026/3,,,,')
})

test('every row carries five cells, so the columns line up in a spreadsheet', () => {
  for (const line of resultTemplate(['NETPRO/2026/1']).trimEnd().split('\r\n')) {
    assert.equal(line.split(',').length, 5)
  }
})

test('a registration number is not mangled by the slashes in it', () => {
  assert.ok(resultTemplate(['NETPRO/2026/12']).includes('NETPRO/2026/12,,,,'))
})

test('a comma or a quote in a number is escaped rather than shifting the row', () => {
  assert.ok(resultTemplate(['NP,2026,1']).includes('"NP,2026,1",,,,'))
  assert.ok(resultTemplate(['NP"26']).includes('"NP""26",,,,'))
})

test('surrounding space is trimmed, so a stray one is not read as part of the number', () => {
  assert.ok(resultTemplate(['  NETPRO/2026/1  ']).includes('NETPRO/2026/1,,,,'))
})

test('the file ends with a newline, which some parsers need to see the last row', () => {
  assert.ok(resultTemplate(['NETPRO/2026/1']).endsWith('\r\n'))
})

test('the file is named for the subject and arm it was built for', () => {
  assert.equal(templateName('Integrated Science', 'JSS1 A'), 'results-integrated-science-jss1-a.csv')
  assert.equal(templateName(), 'results.csv')
  assert.equal(templateName('Mathematics'), 'results-mathematics.csv')
})
