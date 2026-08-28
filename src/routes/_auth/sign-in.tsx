import { createFileRoute } from '@tanstack/react-router'
import { SignInScreen } from '@/features/auth/screens/sign-in'

export const Route = createFileRoute('/_auth/sign-in')({
  staticData: { title: 'Step 1 of 1' },
  component: SignInScreen,
})
