/**
 * The design's buttons, as classes rather than a component: `Button` already
 * owns the pending spinner and the `asChild` link case, and wrapping it again
 * would mean re-declaring both.
 */

/** Full width, 46px, the auth blue. Every screen's main action. */
export const authButton =
  'h-11.5 w-full rounded-md bg-ui-blue text-base font-medium text-white hover:bg-ui-blue/90 focus-visible:ring-ui-blue/40'

/** The same shape for the second way out of a screen, where there is one. */
export const authButtonQuiet =
  'h-11.5 w-full rounded-md border-ui-hint/40 bg-white text-base font-medium text-ui-ink hover:bg-ui-field'
