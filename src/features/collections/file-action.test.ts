import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileActionToast, isFileAction } from './file-action.ts'

test('the actions that hand over a file, across all four portals', () => {
  for (const action of [
    'Export CSV',
    'Export log',
    'Export list',
    'Export results',
    'Download all',
    'Download PDF',
    'Download receipt',
    'Download result sheet',
    'Download timetable',
  ]) {
    assert.equal(isFileAction(action), true, action)
  }
})

test('everything else still opens its own page', () => {
  for (const action of [
    'Create fee',
    'Take a payment',
    'Enrol a pupil',
    'Add a child',
    'Upload CSV / XLSX',
    'Upload results',
    'Request a change',
    'Downloadable archive',
  ]) {
    assert.equal(isFileAction(action), false, action)
  }
})

test('the toast says what will happen', () => {
  assert.equal(fileActionToast('Export CSV'), 'Export CSV — file will download')
})
