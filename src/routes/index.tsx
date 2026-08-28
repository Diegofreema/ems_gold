import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  // The design has no landing page: sign-in is the single entry point for every role.
  beforeLoad: () => redirect({ to: '/sign-in' }),
})
