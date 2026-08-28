import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileActionToast, isFileAction, primaryActionKind } from './primary-action.ts'
import type { CollectionDef } from './types.ts'

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

const routes = {
  record: '/admin/$collection/$recordId',
  edit: '/admin/$collection/$recordId/edit',
  create: '/admin/$collection/new',
  flow: '/admin/$collection/action',
} as const

const def = (action: string): CollectionDef => ({
  id: 'x', path: '/admin/fees', kicker: 'K', title: 'T', description: 'D',
  action, searchHint: '', footer: '', emptyTitle: '', emptyBody: '',
  noun: 'thing', nameKey: 'name', columns: [], rows: [],
})

test('a create route alone is not enough to publish a create page', () => {
  // Fee collection: the list opens the payment flow, so /new is not its page.
  assert.equal(
    primaryActionKind(def('Take a payment'), routes, { label: 'Take a payment', fromList: true }),
    'flow',
  )
  // A download never reaches a form, whatever routes the portal publishes.
  assert.equal(primaryActionKind(def('Export CSV'), routes), 'file')
  // The ordinary case still creates.
  assert.equal(primaryActionKind(def('Create fee'), routes), 'create')
  // A record-scoped flow does not take over the list's button.
  assert.equal(
    primaryActionKind(def('Create fee'), routes, { label: 'Allocate to classes' }),
    'create',
  )
})

test('a portal with no create route falls through to its own destination', () => {
  const readOnly = { record: '/parent/$collection/$recordId' } as const
  assert.equal(primaryActionKind(def('Report an absence'), readOnly), 'none')
  assert.equal(
    primaryActionKind({ ...def('Pay an invoice'), actionTo: '/parent/pay' }, readOnly),
    'link',
  )
})
