import { Link, useNavigate } from '@tanstack/react-router'
import { ChevronDown, LogOut, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLogout } from '@/api/auth/hooks'
import type { AccountSummary } from '@/lib/account'
import { cn } from '@/lib/utils'

/**
 * The whole user block is the trigger; the popup is anchored above it.
 * A full-screen invisible backdrop closes it on outside click.
 */
export function SidebarAccountMenu({
  account,
  profilePath,
}: {
  account: AccountSummary
  profilePath: string
}) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const logout = useLogout()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <div className="relative border-t-2 border-divider px-4 py-3">
      {open && (
        <>
          <div
            className="fixed inset-0 z-45"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-x-3 bottom-[calc(100%-6px)] z-50 animate-ems-pop border-2 border-foreground bg-background shadow-lg">
            <Link
              to={profilePath}
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 border-b border-divider px-3.5 py-3 text-left text-[13.5px] !text-foreground transition-[background-color,padding-left] duration-150 hover:bg-neutral-100 hover:pl-[18px]"
            >
              <User className="size-[15px] flex-none" strokeWidth={1.85} />
              <span className="flex-1">My profile</span>
            </Link>
            {/* The session ends on this device whether or not the server
                answers, so the redirect is unconditional. */}
            <button
              type="button"
              disabled={logout.isPending}
              onClick={async () => {
                setOpen(false)
                await logout.mutateAsync().catch(() => undefined)
                await navigate({ to: '/sign-in' })
              }}
              className="flex w-full cursor-pointer items-center gap-3 px-3.5 py-3 text-left text-[13.5px] !text-brand-700 transition-[background-color,padding-left] duration-150 hover:bg-brand/10 hover:pl-[18px]"
            >
              <LogOut className="size-[15px] flex-none" strokeWidth={1.85} />
              <span className="flex-1">
                {logout.isPending ? 'Signing out…' : 'Sign out'}
              </span>
            </button>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-label="Account menu"
        aria-expanded={open}
        className="-m-1 flex w-full cursor-pointer items-center gap-2.5 p-1 text-left transition-colors hover:bg-foreground/6"
      >
        <div className="grid size-8 flex-none place-items-center bg-neutral-300 font-heading text-xs font-extrabold">
          {account.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold">{account.name}</div>
          <div className="truncate text-[11px] text-muted-foreground">
            {account.line}
          </div>
        </div>
        <ChevronDown
          className={cn(
            'size-3.5 flex-none text-neutral-600 transition-transform duration-200',
            open && 'rotate-180',
          )}
          strokeWidth={2}
        />
      </button>
    </div>
  )
}
