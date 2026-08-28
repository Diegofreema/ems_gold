import { Link, Outlet, useLocation, useMatches } from '@tanstack/react-router'
import { ThemeToggle } from '@/components/layout/header/theme-toggle'
import { AuthPoster } from './auth-poster'

const SCREEN_JUMPS = [
  { to: '/sign-in', label: 'Sign in' },
  { to: '/forgot-password', label: 'Forgotten' },
  { to: '/check-email', label: 'Check email' },
  { to: '/reset-password', label: 'New password' },
  { to: '/session-expired', label: 'Expired' },
  { to: '/wrong-portal', label: 'Wrong portal' },
]

function useStepLabel() {
  const matches = useMatches()
  return (
    [...matches].reverse().find((match) => match.staticData.title)?.staticData
      .title ?? ''
  )
}

/** Poster on the left, a 460px form column on the right. */
export function AuthLayout() {
  const { pathname } = useLocation()
  const stepLabel = useStepLabel()

  return (
    <div className="grid min-h-screen bg-background text-foreground lg:grid-cols-[minmax(0,420px)_1fr]">
      <AuthPoster />

      <main className="flex min-w-0 flex-col">
        <header className="flex items-center gap-3.5 border-b-2 border-divider px-7 py-[18px]">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="size-[22px] flex-none bg-brand" />
            <div className="font-heading text-sm font-extrabold">NETPRO EMS</div>
          </div>
          <div className="flex-1" />
          <div className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
            {stepLabel}
          </div>
          <ThemeToggle />
        </header>

        <div
          key={pathname}
          className="flex flex-1 animate-ems-in items-start px-7 pt-12 pb-16"
        >
          <div className="w-full max-w-[460px]">
            <Outlet />
          </div>
        </div>

        <footer className="flex flex-wrap items-center gap-[18px] border-t-2 border-divider px-7 py-4">
          <div className="text-[11.5px] text-muted-foreground">
            NETPRO EMS · Bronze · 2025/2026 session
          </div>
          <div className="flex-1" />
          {SCREEN_JUMPS.map((jump) => (
            <Link
              key={jump.to}
              to={jump.to}
              className="text-[11.5px] text-muted-foreground no-underline hover:text-brand-700 data-[status=active]:text-foreground data-[status=active]:underline"
            >
              {jump.label}
            </Link>
          ))}
        </footer>
      </main>
    </div>
  )
}
