import { Link } from '@tanstack/react-router'
import { Tag } from '@/components/common/tag'
import type { NavItem } from '@/lib/portal'

/**
 * Active state is the design's left accent bar plus a 10% accent wash;
 * hover nudges the label right by 4px.
 */
export function SidebarNavItem({
  item,
  index,
  onNavigate,
}: {
  item: NavItem
  index: number
  onNavigate: () => void
}) {
  const Icon = item.icon

  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      style={{ animationDelay: `${index * 30}ms` }}
      className="flex w-full animate-ems-row items-center gap-2.5 border-l-2 border-transparent px-2.5 py-2 text-left text-[13.5px] transition-[background-color,color,padding-left] duration-150 hover:bg-foreground/6 hover:pl-3.5 data-[status=active]:border-l-brand data-[status=active]:bg-brand/10 data-[status=active]:text-brand-700"
    >
      <Icon className="size-[15px] flex-none opacity-85" strokeWidth={1.75} />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <Tag variant="accent" className="px-1.5 py-px text-[10px]">
          {item.badge}
        </Tag>
      )}
    </Link>
  )
}
