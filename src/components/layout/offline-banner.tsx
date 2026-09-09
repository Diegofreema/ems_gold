import { AlertTriangle, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { drain, setDrawerOpener } from '@/db/drain'
import { useSyncStatus } from '@/db/status'
import { PendingWork } from '@/features/sync/components/pending-work'
import { syncMessage } from '@/features/sync/message'

/**
 * The bar under the header, and the only place the app tells anybody what is
 * happening to their work.
 *
 * It used to say one thing in all weather: that nothing was being saved but it
 * would send when the connection returned. That was untrue — there was no
 * queue — and the point of this bar now is that each of the three things it
 * can say is true when it says it.
 */
export function OfflineBanner() {
  const { online, durable, waiting, failed, review } = useSyncStatus()
  const [showing, setShowing] = useState(false)

  // The drain announces a late failure with a Review action; this is what that
  // action opens.
  useEffect(() => setDrawerOpener(() => setShowing(true)), [])

  const needsAnswer = failed + review
  const held = waiting > 0

  // Nothing to report: connected, and the school has everything.
  const quiet = online && !held && needsAnswer === 0

  return (
    <>
      {!quiet && (
        <div
          className={`flex animate-ems-up items-center gap-3.5 px-content py-2.75 text-white ${
            needsAnswer > 0 ? 'bg-destructive' : 'bg-brand'
          }`}
        >
          {needsAnswer > 0 ? (
            <AlertTriangle className="size-4.25 flex-none" strokeWidth={2.1} />
          ) : (
            <WifiOff className="size-4.25 flex-none" strokeWidth={2.1} />
          )}

          <div className="flex-1 text-sm">
            {syncMessage({ online, durable, waiting, needsAnswer })}
          </div>

          {(held || needsAnswer > 0) && (
            <button
              type="button"
              onClick={() => setShowing(true)}
              className="cursor-pointer rounded-md border border-white bg-white px-3.5 py-2 font-heading text-sm font-extrabold text-neutral-900"
            >
              {needsAnswer > 0 ? 'Review' : 'See what'}
            </button>
          )}

          {online && held && needsAnswer === 0 && (
            <button
              type="button"
              onClick={() => void drain()}
              className="cursor-pointer rounded-md border border-white px-3.5 py-2 font-heading text-sm font-extrabold text-white"
            >
              Send now
            </button>
          )}
        </div>
      )}

      <PendingWork open={showing} onOpenChange={setShowing} />
    </>
  )
}
