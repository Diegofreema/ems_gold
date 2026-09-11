import { Menu } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { RouteProgress } from '@/components/layout/route-progress'
import type { AccountSummary } from '@/lib/account'
import { useShellStore } from '@/stores/shell.store'
import { AccountChip } from './account-chip'
import { HeaderSearch } from './header-search'
import { ThemeToggle } from './theme-toggle'

/**
 * Search on the left, the controls and whoever is signed in on the right.
 *
 * The page's own title used to live here, over a breadcrumb. It has gone to
 * the page: every screen already opens with its title, so the header was
 * saying it twice — and the second saying cost the width the search box now
 * has. The one place it still earns its keep is a narrow viewport, where the
 * menu button stands in its place.
 */
export function AppHeader({
  searchPath,
  account,
  profilePath,
  narrow,
  children,
}: {
  /** Set only by a portal with something to search. */
  searchPath?: string
  account: AccountSummary
  profilePath: string
  narrow: boolean
  /** The sync chip, the messages door and the notification bell. */
  children?: ReactNode
}) {
  const openDrawer = useShellStore((state) => state.openDrawer)

  return (
    <header className="sticky top-0 z-20 flex h-18 items-center gap-3 border-b border-divider bg-raised px-content">
      {narrow && (
        <Button
          variant="outline"
          size="icon"
          onClick={openDrawer}
          aria-label="Open the menu"
          className="size-10 flex-none rounded-lg"
        >
          <Menu className="size-[18px]" strokeWidth={2} />
        </Button>
      )}

      {searchPath ? <HeaderSearch to={searchPath} /> : null}

      <div className="flex-1" />

      {children}
      <ThemeToggle />
      <AccountChip account={account} profilePath={profilePath} />

      {/* Sits on the header's own bottom border, so it is in view however far
          a long register has been scrolled. See `RouteProgress`. */}
      <RouteProgress />
    </header>
  )
}
