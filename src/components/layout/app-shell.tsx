import { Outlet, useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAccountSummary } from '@/features/auth/session'
import { MessagesButton } from '@/features/messages/components/messages-button'
import { NotificationBell } from '@/features/notifications/components/notification-bell'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import type { PortalConfig } from '@/lib/portal'
import { useShellStore } from '@/stores/shell.store'
import { AppHeader } from './header/app-header'
import { OfflineBanner } from './offline-banner'
import { Sidebar } from './sidebar/sidebar'
import { SyncChip } from './sync-chip'

export function AppShell({ config }: { config: PortalConfig }) {
  const notifications = config.useNotifications()
  const narrow = useBreakpoint('narrow')
  const drawerOpen = useShellStore((state) => state.drawerOpen)
  const closeDrawer = useShellStore((state) => state.closeDrawer)
  const { pathname } = useLocation()
  const account = useAccountSummary(config.roleLabel)

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
    <div className="flex min-h-dvh bg-background text-foreground">
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

      <main className="flex min-w-0 flex-1 flex-col bg-ground">
        <AppHeader
          searchPath={config.searchPath}
          account={account}
          profilePath={`${config.basePath}/profile`}
          narrow={narrow}
        >
          <SyncChip />
          {config.messagesPath && <MessagesButton to={config.messagesPath} />}
          <NotificationBell
            notifications={notifications}
            allPath={`${config.basePath}/notifications`}
          />
        </AppHeader>
        <OfflineBanner />
        {config.contextBar}

        {/* Keyed on the route so the entrance animation replays on navigation. */}
        <div
          key={pathname}
          className="mx-auto w-full max-w-[1280px] flex-1 animate-ems-in p-content"
        >
          <Outlet />
        </div>
      </main>
    </div>
  )
}
