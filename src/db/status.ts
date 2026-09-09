import { useLiveQuery } from '@tanstack/react-db'
import { useOnlineStatus } from '@/hooks/use-online-status'
import type { OutboxOp } from './outbox'
import { runtime } from './runtime'
import { outbox } from './store'

export type SyncStatus = {
  online: boolean
  /** Whether work written now survives a reload. */
  durable: boolean
  /** Written down, not yet sent. */
  waiting: number
  /** The school refused these, or something they needed failed. */
  failed: number
  /** In flight when the tab died, and not safe to send again unasked. */
  review: number
  /** Everything the reader could be shown in the drawer, newest last. */
  ops: OutboxOp[]
}

/**
 * What the header pill, the offline banner and the pending-work drawer all
 * read.
 *
 * A live query rather than a poll: the counts move the moment the queue does,
 * which is the difference between a reader trusting the number and checking it.
 */
export function useSyncStatus(): SyncStatus {
  const online = useOnlineStatus()
  const { data } = useLiveQuery({ query: (q) => q.from({ op: outbox() }) })

  const ops = (data ?? []) as OutboxOp[]

  return {
    online,
    durable: runtime.durable,
    waiting: ops.filter((op) => op.state === 'queued' || op.state === 'sending').length,
    failed: ops.filter((op) => op.state === 'failed' || op.state === 'conflict').length,
    review: ops.filter((op) => op.state === 'needs-review').length,
    ops: [...ops].sort((a, b) => a.seq - b.seq),
  }
}
