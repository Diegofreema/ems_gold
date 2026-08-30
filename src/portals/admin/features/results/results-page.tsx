import { Link } from '@tanstack/react-router'
import { EmptyState } from '@/components/feedback/empty-state'
import { PageHeader } from '@/components/page/page-header'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'

/**
 * Results, as far as the school's server allows.
 *
 * There is no admin results endpoint on the API. Every name it could go under
 * — `/results`, `/admin-results`, `/uploads`, `/broadsheets`, `/grades` and a
 * dozen more — answers `MissingControllerException`, which is this API's way
 * of saying the route was never deployed, not that the office lacks the right
 * to it. The only results routes that exist are scoped to one person:
 * `teachers/me/results`, `teachers/me/uploads` and `students/me/results`, none
 * of which an administrator can call, and `students/{id}/results`, which is
 * reachable but answers with an empty list for every pupil on record.
 *
 * This page used to show six invented batches — BAT-1142, a class average, an
 * Approved tag. An office reading those as real is worse than an office told
 * plainly that the feature is not there yet, so they are gone until there is
 * an endpoint to put in their place.
 */
export function ResultsPage() {
  return (
    <div className="max-w-[900px]">
      <PageHeader
        kicker="Academics"
        title="Results"
        description="Where uploaded score sheets are reviewed and approved."
      />
      <Rule />

      <EmptyState
        title="Results are not on this server yet"
        body="The school's API has no endpoint the office can read results through — teachers can enter and see their own, but nothing exposes them to an administrator. This page will list uploaded batches, and let you approve or reject them, as soon as it does."
        action={
          <Button asChild variant="outline">
            <Link to="/admin/subjects">Go to subjects</Link>
          </Button>
        }
      />

      <p className="mt-[18px] max-w-[70ch] text-[12.5px] text-muted-foreground">
        In the meantime, how many results are filed against a subject, an arm, a
        term or a session is on each of their record pages — the API counts them
        even though it will not yet hand them over.
      </p>
    </div>
  )
}
