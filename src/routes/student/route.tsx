import { createFileRoute } from '@tanstack/react-router'
import { NotFoundState } from '@/components/feedback/not-found-state'
import { AppShell } from '@/components/layout/app-shell'
import { requirePortal } from '@/features/auth/guard'
import { studentPortal } from '@/portals/student/config'

export const Route = createFileRoute('/student')({
  beforeLoad: ({ context }) => requirePortal(context.queryClient, 'Student'),
  component: () => <AppShell config={studentPortal} />,
  // Keeps the shell around a 404, as the design shows it.
  notFoundComponent: () => (
    <AppShell config={studentPortal} heading={{ title: 'Not found', crumb: '' }}>
      <NotFoundState
        links={studentPortal.notFoundLinks}
        audience={studentPortal.notFoundAudience}
      />
    </AppShell>
  ),
})
