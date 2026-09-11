import { Link, useNavigate } from '@tanstack/react-router'
import { LogOut, Settings } from 'lucide-react'
import { useLogout } from '@/api/auth/hooks'

const ROW =
  'flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-[15px] transition-colors hover:bg-neutral-100'

/**
 * The foot of the rail. Two things somebody looks for by name rather than by
 * section — where their own settings are, and the way out.
 *
 * Signing out ends the session on this device whether or not the school
 * answers, so the redirect is unconditional.
 */
export function SidebarTools({
  settingsPath,
  onNavigate,
}: {
  settingsPath: string
  onNavigate: () => void
}) {
  const navigate = useNavigate()
  const logout = useLogout()

  // A rule above it, because the nav scrolls: without one, a long register's
  // nav runs out mid-row right under the Tools heading and the two read as one
  // list.
  return (
    <div className="mt-auto border-t border-divider px-4 pt-4 pb-6">
      <div className="px-3 pb-2 font-heading text-2xs font-extrabold uppercase tracking-kicker text-muted-foreground">
        Tools
      </div>

      <Link to={settingsPath} onClick={onNavigate} className={ROW}>
        <Settings className="size-5 flex-none" strokeWidth={1.9} />
        <span className="flex-1 truncate">Settings</span>
      </Link>

      <button
        type="button"
        disabled={logout.isPending}
        onClick={async () => {
          onNavigate()
          await logout.mutateAsync().catch(() => undefined)
          await navigate({ to: '/sign-in' })
        }}
        className={`${ROW} cursor-pointer !text-danger-ink hover:bg-danger-subtle`}
      >
        <LogOut className="size-5 flex-none" strokeWidth={1.9} />
        <span className="flex-1 truncate">
          {logout.isPending ? 'Signing out…' : 'Logout'}
        </span>
      </button>
    </div>
  )
}
