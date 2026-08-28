import { Outlet, useLocation, useMatches } from '@tanstack/react-router'
import { useEffect, type ReactNode } from 'react'
import { NotificationBell } from '@/features/notifications/components/notification-bell'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import type { PortalConfig } from '@/lib/portal'
import { useShellStore } from '@/stores/shell.store'
import { AppHeader } from './header/app-header'
import { OfflineBanner } from './offline-banner'
import { Sidebar } from './sidebar/sidebar'

type Heading = { title: string; crumb: string }

function headingOf(match: { staticData: { title?: string; crumb?: string }; loaderData?: unknown }): Heading | undefined {
  if (match.staticData.title) {
    return { title: match.staticData.title, crumb: match.staticData.crumb ?? '' }
  }
  // Routes whose title depends on the record publish it from their loader.
  const fromLoader = (match.loaderData as { heading?: Heading } | undefined)?.heading
  return fromLoader
}

/** Routes describe their own header text; the shell reads the deepest one. */
function useRouteHeading(): Heading {
  const matches = useMatches()
  for (const match of [...matches].reverse()) {
    const heading = headingOf(match)
    if (heading) return heading
  }
  return { title: '', crumb: '' }
}

export function AppShell({
  config,
  children,
  heading,
}: {
  config: PortalConfig
  /** Rendered instead of the matched route — used for the in-shell 404. */
  children?: ReactNode
  /** Header text when there is no matched route to read it from. */
  heading?: Heading
}) {
  const narrow = useBreakpoint('narrow')
  const drawerOpen = useShellStore((state) => state.drawerOpen)
  const closeDrawer = useShellStore((state) => state.closeDrawer)
  const { pathname } = useLocation()
  const routeHeading = useRouteHeading()
  const { title, crumb } = heading ?? routeHeading

  const drawerVisible = narrow && drawerOpen

  useEffect(() => {
    if (!drawerVisible) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDrawer()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [drawerVisible, closeDrawer])

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {(!narrow || drawerVisible) && (
        <Sidebar config={config} asDrawer={narrow} />
      )}

      {drawerVisible && (
        <div
          className="fixed inset-0 z-30 animate-ems-fade bg-neutral-900/45"
          onClick={closeDrawer}
          aria-hidden
        />
      )}

      <main className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          crumb={crumb}
          title={title}
          status={config.headerStatus}
          narrow={narrow}
        >
          <NotificationBell
            notifications={config.notifications}
            allPath={`${config.basePath}/notifications`}
          />
        </AppHeader>
        <OfflineBanner />
        {config.contextBar}

        {/* Keyed on the route so the entrance animation replays on navigation. */}
        <div key={pathname} className="flex-1 animate-ems-in p-content">
          {children ?? <Outlet />}
        </div>
      </main>
    </div>
  )
}
