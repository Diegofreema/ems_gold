import { Link } from '@tanstack/react-router'
import { TriangleAlert } from 'lucide-react'
import { ApiError } from '@/api/client'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'
import { errorMessage, OFFLINE_MESSAGE } from '@/lib/errors'

/**
 * The technical line, for the person the reader forwards this to.
 *
 * The body above it is already the API's own sentence, so this says the part a
 * reader cannot: what kind of failure it was. A request that never reached the
 * server has no status and no message worth printing, and its name — a
 * `TypeError` from fetch — is exactly what an ICT desk asks for first.
 */
function reference(error: unknown): string {
  if (error instanceof ApiError) return `HTTP ${error.status}`
  if (error instanceof Error) return `${error.name}: ${error.message}`
  return 'No response from the server'
}

/**
 * Shown when a page's data fails to load — as a route's error boundary, and by
 * the handful of screens that fetch outside one.
 *
 * The API's own sentence is the body wherever there is one: "No parent record
 * is linked to this account" tells the office something, and "Something went
 * wrong" tells nobody anything.
 */
export function ErrorState({
  error,
  homeTo,
  onRetry,
}: {
  error: unknown
  /** Where "back to dashboard" goes — the portal this reader belongs to. */
  homeTo: string
  onRetry: () => void
}) {
  return (
    <div className="max-w-[560px] py-10">
      <div className="grid size-10 place-items-center bg-brand text-background">
        <TriangleAlert className="size-[22px]" strokeWidth={2.2} />
      </div>
      <h2 className="mt-5 text-page-title">This page could not load</h2>
      <p className="mt-2.5 text-sm text-muted-foreground">
        {errorMessage(error, OFFLINE_MESSAGE)}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Nothing was changed. Try again, and if it keeps failing send the
        reference below to your ICT desk.
      </p>
      <div className="mt-[18px] border-2 border-divider px-4 py-3.5 font-heading text-[12.5px] font-extrabold break-words">
        {reference(error)}
      </div>
      <Rule />
      <div className="flex flex-wrap gap-2.5">
        <Button onClick={onRetry}>Try again</Button>
        <Button asChild variant="outline">
          <Link to={homeTo}>Back to dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
