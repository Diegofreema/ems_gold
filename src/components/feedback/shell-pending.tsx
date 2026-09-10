import { SidebarBrand } from '@/components/layout/sidebar/sidebar-brand'
import type { PortalConfig } from '@/lib/portal'
import { RoutePending } from './route-pending'
import { Shimmer } from './shimmer'

/**
 * What a portal shows while it is opening, as that shell route's own
 * `pendingComponent`.
 *
 * The first sign-in on a device is the one time this is on screen long enough
 * to be read: there is no cached account, so the guard waits on `/users/me`
 * before the shell may render at all. Left to the default page skeleton, that
 * wait drew three grey bars in the top-left of an empty white document and
 * then, in one frame, replaced them with a 248px sidebar, a header and a
 * padded page — the whole application arriving as a jump-cut. Somebody's first
 * impression of the portal was a screen that looked broken and then looked
 * like something else.
 *
 * So the pending state is the shell: the same rail at the same width, the same
 * bordered header at the same height, the same 1280px content column. Only the
 * contents are grey, and when the account lands they fill in where they
 * already were.
 *
 * What is drawn for real is what is already known without asking the school —
 * the brand mark and which portal is opening, both static per route. The nav
 * is not: a visitor who has signed into the wrong portal is about to be sent
 * to `/wrong-portal`, and the labels of a register they may not open have no
 * business flashing up on the way. Placeholders make the same shape and claim
 * nothing.
 *
 * Built per portal, the same way `portalNotFound` is, because the shell route
 * is the only place that knows which portal it is.
 */
export const shellPending = (config: PortalConfig) => () => {
  // The number of grey headings matches the real nav's, so the rail does not
  // visibly lengthen when it fills in. Groups start collapsed, so what is on
  // screen at first paint is the ungrouped block's items and then a run of
  // headings — which is exactly what this draws.
  const [first, ...groups] = config.nav
  const items = first?.items.length ?? 3

  return (
    <div
      className="flex min-h-screen bg-background text-foreground"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Opening the {config.roleLabel} portal</span>

      {/* Hidden below the design's 900px breakpoint, where the real sidebar is
          a drawer rather than a rail — see `useBreakpoint('narrow')`. */}
      <aside className="sticky top-0 z-40 hidden h-screen w-62 flex-none flex-col border-r border-divider bg-background min-[900px]:flex">
        <SidebarBrand roleLabel={config.roleLabel} />

        {/*
          Only the office's nav search, which always renders. The block the
          other portals put here is their context panel — the pupil's own
          record, the household, the term being marked — and each returns
          nothing until its set is on the device, which on a first sign-in it
          is not. A placeholder there would be a block that vanished and took
          the nav up with it.
        */}
        {config.searchableNav && (
          <div className="border-b border-divider px-4 py-3.5">
            <Shimmer className="h-8 w-full rounded-md" />
          </div>
        )}

        <nav className="flex-1 overflow-hidden px-2 pt-1 pb-5">
          <div className="mb-1.5">
            {Array.from({ length: items }, (_, index) => (
              <div key={index} className="flex items-center gap-2.5 px-2.5 py-2">
                <Shimmer className="size-3.75 flex-none rounded-sm" delay={index * 40} />
                <Shimmer className="h-3 flex-1 rounded-sm" delay={index * 40} />
              </div>
            ))}
          </div>

          {groups.map((group, index) => (
            <div key={group.heading ?? index} className="mb-1.5 px-2 pt-3 pb-2">
              <Shimmer
                className="h-2.5 w-24 rounded-sm"
                delay={(items + index) * 40}
              />
            </div>
          ))}
        </nav>

        <div className="border-t border-divider px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Shimmer className="size-8 flex-none rounded-md" />
            <div className="min-w-0 flex-1">
              <Shimmer className="h-3 w-24 rounded-sm" delay={60} />
              <Shimmer className="mt-1.25 h-2.5 w-16 rounded-sm" delay={100} />
            </div>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3.5 border-b border-divider bg-background px-content py-3.5">
          {/* The drawer button, which only exists at the narrow breakpoint. */}
          <Shimmer className="size-9 flex-none rounded-md min-[900px]:hidden" />

          <div className="min-w-0 flex-1">
            <Shimmer className="h-2.5 w-20 rounded-sm" />
            <Shimmer className="mt-1.5 h-4 w-44 rounded-sm" delay={60} />
          </div>

          {/* The term the office and the guardian portals carry on the right.
              It is `hidden sm:block` in the header itself, so it is here too —
              the controls are anchored right either way and do not move. */}
          {config.headerStatus && (
            <div className="hidden flex-none text-right sm:block">
              <Shimmer className="h-2.5 w-28 rounded-sm" delay={80} />
              <Shimmer className="mt-1 h-2.5 w-20 rounded-sm" delay={110} />
            </div>
          )}

          {/* One square per control the header will actually carry: the
              messages button where the portal has one, the bell, the theme
              toggle. A square too many and the title shifts left as it fills. */}
          {config.messagesPath && (
            <Shimmer className="size-9 flex-none rounded-md" delay={120} />
          )}
          <Shimmer className="size-9 flex-none rounded-md" delay={160} />
          <Shimmer className="size-9 flex-none rounded-md" delay={200} />
        </header>

        <div className="mx-auto w-full max-w-[1280px] flex-1 p-content">
          <RoutePending />
        </div>
      </main>
    </div>
  )
}
