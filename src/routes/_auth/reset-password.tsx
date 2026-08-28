import { createFileRoute } from '@tanstack/react-router'
import { ResetPasswordScreen } from '@/features/auth/screens/reset-password'

export const Route = createFileRoute('/_auth/reset-password')({
  staticData: { title: 'Reset · step 3 of 3' },
  component: () => <ResetPasswordScreen first={false} />,
})
