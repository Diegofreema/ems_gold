import { Menu } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { useShellStore } from '@/stores/shell.store'
import { ThemeToggle } from './theme-toggle'

/**
 * Sticky bar: breadcrumb over page title on the left, portal status and the
 * bell/theme controls on the right.
 */
export function AppHeader({
  crumb,
  title,
  status,
  narrow,
  children,
}: {
  crumb: string
  title: string
  status?: ReactNode
  narrow: boolean
  /** Portal-agnostic slot for the notification bell. */
  children?: ReactNode
}) {
  const openDrawer = useShellStore((state) => state.openDrawer)

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3.5 border-b-2 border-divider bg-background px-content py-3.5">
      {narrow && (
        <Button
          variant="outline"
          size="icon"
          onClick={openDrawer}
          aria-label="Open the menu"
          className="size-9"
        >
          <Menu className="size-[17px]" strokeWidth={2} />
        </Button>
      )}

      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {crumb}
        </div>
        <div className="font-heading text-[17px] leading-[1.15] font-extrabold">
          {title}
        </div>
      </div>

      {status && (
        <div className="text-right text-[11px] leading-[1.35] text-muted-foreground">
          {status}
        </div>
      )}

      {children}
      <ThemeToggle />
    </header>
  )
}
