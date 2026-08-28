import { createFileRoute } from '@tanstack/react-router'
import { WrongPortalScreen } from '@/features/auth/screens/wrong-portal'

export const Route = createFileRoute('/_auth/wrong-portal')({
  staticData: { title: 'Access' },
  component: WrongPortalScreen,
})
