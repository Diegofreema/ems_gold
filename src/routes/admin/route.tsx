import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/app-shell'
import { adminPortal } from '@/portals/admin/config'

export const Route = createFileRoute('/admin')({
  component: () => <AppShell config={adminPortal} />,
})
