import { createFileRoute } from '@tanstack/react-router'
import { NotFoundState } from '@/components/feedback/not-found-state'
import { AppShell } from '@/components/layout/app-shell'
import { requirePortal } from '@/features/auth/guard'
import { teacherPortal } from '@/portals/teacher/config'

export const Route = createFileRoute('/teacher')({
  beforeLoad: ({ context }) => requirePortal(context.queryClient, 'Teacher'),
  component: () => <AppShell config={teacherPortal} />,
  // Keeps the shell around a 404, as the design shows it.
  notFoundComponent: () => (
    <AppShell config={teacherPortal} heading={{ title: 'Not found', crumb: '' }}>
      <NotFoundState
        links={teacherPortal.notFoundLinks}
        audience={teacherPortal.notFoundAudience}
      />
    </AppShell>
  ),
})
