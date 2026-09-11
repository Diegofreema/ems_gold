import { Link } from '@tanstack/react-router'
import { Tag } from '@/components/common/tag'
import { isPortalHome } from '@/lib/nav'
import type { NavItem } from '@/lib/portal'
import { cn } from '@/lib/utils'

/**
 * A row of the rail. Active is the design's filled blue pill — no left bar, no
 * wash: one row is where you are, and it is the only coloured thing on the
 * rail.
 */
export function SidebarNavItem({
  item,
  onNavigate,
}: {
  item: NavItem
  onNavigate: () => void
}) {
  const Icon = item.icon

  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      activeOptions={{ exact: isPortalHome(item.to) }}
      className={cn(
        'flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-[15px] transition-colors',
        'hover:bg-neutral-100 data-[status=active]:bg-brand data-[status=active]:font-medium data-[status=active]:!text-white',
      )}
    >
      <Icon className="size-5 flex-none" strokeWidth={1.9} />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && (
        <Tag variant="accent" className="px-1.5 py-px text-2xs">
          {item.badge}
        </Tag>
      )}
    </Link>
  )
}

/**
 * A row inside an opened section. No icon: the section above it carries the
 * one that matters, and a second column of them turns a list of four pages
 * into a wall of pictograms.
 */
export function SidebarSubItem({
  item,
  onNavigate,
}: {
  item: NavItem
  onNavigate: () => void
}) {
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      activeOptions={{ exact: isPortalHome(item.to) }}
      className={cn(
        'relative flex h-9 items-center rounded-md pl-5 text-sm text-muted-foreground transition-colors',
        // The tick joining this row to the section's own line.
        'before:absolute before:top-1/2 before:left-0 before:h-px before:w-3 before:bg-divider',
        'hover:text-foreground data-[status=active]:font-medium data-[status=active]:!text-brand',
      )}
    >
      <span className="truncate">{item.label}</span>
    </Link>
  )
}
