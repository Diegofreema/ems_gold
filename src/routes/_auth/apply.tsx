import { createFileRoute } from '@tanstack/react-router'
import { STEPS, type Step } from '@/features/admission/application'
import { ApplyScreen } from '@/features/admission/screens/apply'

/**
 * Applying for a place, for a family with no account.
 *
 * The step is in the address so the phone's back button goes back a step
 * rather than out of the form altogether — which is where it went while the
 * step was only component state, taking three pages of typing with it.
 */
export const Route = createFileRoute('/_auth/apply')({
  validateSearch: (search: Record<string, unknown>): { step?: Step['id'] } => {
    const step = STEPS.find((one) => one.id === search.step)
    return step && step.id !== STEPS[0].id ? { step: step.id } : {}
  },
  staticData: { title: 'Apply for admission' },
  component: ApplyScreen,
})
