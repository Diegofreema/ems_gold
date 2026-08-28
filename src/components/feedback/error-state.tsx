import { TriangleAlert } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'

/** Shown when a page's data fails to load. The reference is what ICT needs. */
export function ErrorState({
  reference,
  dashboardPath,
  onRetry,
}: {
  reference: string
  dashboardPath: string
  onRetry: () => void
}) {
  return (
    <div className="max-w-[560px] py-10">
      <div className="grid size-10 place-items-center bg-brand text-background">
        <TriangleAlert className="size-[22px]" strokeWidth={2.2} />
      </div>
      <h2 className="mt-5 text-page-title">This page could not load</h2>
      <p className="mt-2.5 text-sm text-muted-foreground">
        The server did not answer in time. Nothing was changed. Try again, and if
        it keeps failing send the reference below to your ICT desk.
      </p>
      <div className="mt-[18px] border-2 border-divider px-4 py-3.5 font-heading text-[12.5px] font-extrabold">
        {reference}
      </div>
      <Rule />
      <div className="flex flex-wrap gap-2.5">
        <Button onClick={onRetry}>Try again</Button>
        <Button asChild variant="outline">
          <Link to={dashboardPath}>Back to dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
