import { createFileRoute } from '@tanstack/react-router'
import { NotFoundState } from '@/components/feedback/not-found-state'
import { AppShell } from '@/components/layout/app-shell'
import { parentPortal } from '@/portals/parent/config'

export const Route = createFileRoute('/parent')({
  component: () => <AppShell config={parentPortal} />,
  // Keeps the shell around a 404, as the design shows it.
  notFoundComponent: () => (
    <AppShell config={parentPortal} heading={{ title: 'Not found', crumb: '' }}>
      <NotFoundState
        links={parentPortal.notFoundLinks}
        audience={parentPortal.notFoundAudience}
      />
    </AppShell>
  ),
})
