import { createFileRoute } from '@tanstack/react-router'
import { NotFoundState } from '@/components/feedback/not-found-state'
import { AppShell } from '@/components/layout/app-shell'
import { adminPortal } from '@/portals/admin/config'

export const Route = createFileRoute('/admin')({
  component: () => <AppShell config={adminPortal} />,
  // Keeps the shell around a 404, as the design shows it.
  notFoundComponent: () => (
    <AppShell config={adminPortal} heading={{ title: 'Not found', crumb: '' }}>
      <NotFoundState
        links={adminPortal.notFoundLinks}
        audience={adminPortal.notFoundAudience}
      />
    </AppShell>
  ),
})
