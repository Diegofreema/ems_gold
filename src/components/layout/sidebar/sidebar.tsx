import type { PortalConfig } from '@/lib/portal'
import { cn } from '@/lib/utils'
import { useShellStore } from '@/stores/shell.store'
import { SidebarBrand } from './sidebar-brand'
import { SidebarNavGroup } from './sidebar-nav-group'
import { SidebarTools } from './sidebar-tools'

/**
 * 264px rail on desktop; the shell renders it inside a drawer when the
 * viewport is narrow.
 *
 * The search box that used to sit under the mark has moved into the header,
 * where it searches the school's own registers rather than filtering this
 * list — see `HeaderSearch`. Sections are collapsed until they are opened, and
 * the choice is remembered per device.
 */
export function Sidebar({
  config,
  asDrawer,
}: {
  config: PortalConfig
  asDrawer: boolean
}) {
  const expandedGroups = useShellStore((state) => state.expandedGroups)
  const toggleGroup = useShellStore((state) => state.toggleGroup)
  const closeDrawer = useShellStore((state) => state.closeDrawer)

  return (
    <aside
      className={cn(
        'z-40 flex h-dvh w-66 flex-none flex-col border-r border-divider bg-raised',
        asDrawer ? 'fixed inset-y-0 left-0 animate-ems-drawer' : 'sticky top-0',
      )}
    >
      <SidebarBrand />
      {config.context}

      <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-4 pb-6">
        {config.nav.map((group, index) => (
          <SidebarNavGroup
            key={group.heading ?? `group-${index}`}
            group={group}
            collapsed={Boolean(
              group.heading && !expandedGroups[group.heading],
            )}
            onToggle={() => group.heading && toggleGroup(group.heading)}
            onNavigate={closeDrawer}
          />
        ))}
      </nav>

      <SidebarTools
        settingsPath={config.settingsPath ?? `${config.basePath}/profile`}
        onNavigate={closeDrawer}
      />
    </aside>
  )
}
