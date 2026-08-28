import type { QueryClient } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from '@tanstack/react-router'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'
import { lazy, Suspense, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { useUiStore } from '@/stores/ui-store'

const Devtools = import.meta.env.PROD
  ? () => null
  : lazy(async () => {
      const [router, query] = await Promise.all([
        import('@tanstack/react-router-devtools'),
        import('@tanstack/react-query-devtools'),
      ])
      return {
        default: () => (
          <>
            <router.TanStackRouterDevtools position="bottom-left" />
            <query.ReactQueryDevtools buttonPosition="bottom-right" />
          </>
        ),
      }
    })

export type RouterContext = {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  const theme = useUiStore((state) => state.theme)
  const toggleTheme = useUiStore((state) => state.toggleTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <NuqsAdapter>
      <div className="min-h-svh bg-background text-foreground">
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
          <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-6 px-6">
            <Link to="/" className="font-semibold tracking-tight">
              ems<span className="text-muted-foreground">/gold</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/tasks">Tasks</NavLink>
            </nav>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? 'Light' : 'Dark'} mode
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl px-6 py-10">
          <Outlet />
        </main>

        <Toaster />
        <Suspense>
          <Devtools />
        </Suspense>
      </div>
    </NuqsAdapter>
  )
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-muted data-[status=active]:text-foreground"
      activeOptions={{ exact: to === '/' }}
    >
      {children}
    </Link>
  )
}

function NotFound() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground">
        That route doesn&apos;t exist yet.
      </p>
      <Button asChild variant="outline">
        <Link to="/">Back home</Link>
      </Button>
    </div>
  )
}

