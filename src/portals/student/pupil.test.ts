import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Student, StudentDashboard } from '../../api/my-schooling/types.ts'
import { armOf, feeStanding } from './pupil.ts'

const STUDENT = {
  class_arm: { id: 4, arm_name: 'JSS 2 A' },
  department: { id: 2, name: 'SSS I' },
} as unknown as Student

const stats = (invoices_unpaid: number): StudentDashboard => ({
  stats: {
    invoices_total: 4,
    invoices_unpaid,
    results_available: 0,
    materials_available: 0,
    fees_settled_this_session: 3,
  },
})

test('the arm is what the pupil is shown as, with the class behind it', () => {
  assert.equal(armOf(STUDENT), 'JSS 2 A')
  assert.equal(armOf({ ...STUDENT, class_arm: undefined } as Student), 'SSS I')
})

test('nothing owing reads as cleared', () => {
  assert.deepEqual(feeStanding(stats(0)), { label: 'Fees cleared', owing: false })
})

test('what is owed is counted, and one bill is not "1 invoices"', () => {
  assert.deepEqual(feeStanding(stats(1)), { label: '1 invoice unpaid', owing: true })
  assert.equal(feeStanding(stats(3))?.label, '3 invoices unpaid')
})

test('no answer yet says nothing, rather than saying cleared', () => {
  assert.equal(feeStanding(undefined), null)
  assert.equal(feeStanding({} as StudentDashboard), null)
})
