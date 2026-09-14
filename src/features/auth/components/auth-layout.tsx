import { Outlet, useLocation } from '@tanstack/react-router'
import { AuthPoster } from './auth-poster'

/**
 * Poster on the left, the form on the right, nothing else on the page.
 *
 * The chrome the earlier layout carried — a step label, a theme toggle, a
 * footer naming the deployment — is gone on purpose: the design has none of
 * it, and a sign-in page is the one screen where every pixel that is not the
 * form is something else to read before signing in.
 *
 * The form is held at the top rather than centred, and the drop above it is
 * `--auth-lead` — a clamp on the height of the screen, so the four screens of
 * a password reset keep the mark in one place as they follow each other, and
 * a short laptop does not spend a fifth of its screen on the space above a
 * logo. See `index.css` for the set.
 *
 * `auth-daylight` pins this subtree to the light palette, and declares those
 * measurements. The design has no dark half, and a white page inheriting the
 * dark theme's pale text is unreadable.
 */
export function AuthLayout() {
  const { pathname } = useLocation()

  return (
    <div className="auth-daylight grid min-h-dvh bg-white text-ui-ink lg:grid-cols-[minmax(0,48.6%)_minmax(0,1fr)]">
      <AuthPoster />

      <main className="flex min-w-0 justify-center px-6 py-12 lg:px-8 lg:pt-(--auth-lead) lg:pb-12">
        {/* Keyed on the path so each step of a reset arrives rather than
            swapping in place — the three screens are otherwise identical
            enough that nothing on them moves. */}
        <div key={pathname} className="w-full max-w-107 animate-ems-in">
          <img
            src="/netpro-logo.webp"
            alt="netpro"
            className="mb-(--auth-mark) h-7 w-auto sm:h-8"
          />
          <Outlet />
        </div>
      </main>
    </div>
  )
}
