import { MailOpen } from 'lucide-react'
import type { ConversationSummary } from '@/api/conversations/types'
import { Tag } from '@/components/common/tag'
import { plainText } from '@/features/collections/rich-text'
import { cn } from '@/lib/utils'
import { threadHeading, withNames } from '../inbox'
import { isQueuedThread } from '../queued'

/**
 * The left-hand column: one row per thread, most recently active first.
 *
 * A row is a button rather than a link because the thread opens beside it on a
 * wide screen and over it on a narrow one — the URL still carries which thread
 * is open, so the view is shareable and survives a reload; it is the page that
 * puts it there.
 */
export function ThreadList({
  threads,
  selectedId,
  onSelect,
  emptyLine,
}: {
  threads: ConversationSummary[]
  selectedId: number | null
  onSelect: (thread: ConversationSummary) => void
  /** What to say when the filter and the search between them found nothing. */
  emptyLine: string
}) {
  if (!threads.length) {
    return (
      <div className="px-5 py-12 text-center">
        <div className="mx-auto grid size-9 place-items-center rounded-lg border border-divider text-neutral-600">
          <MailOpen className="size-4.5" strokeWidth={1.8} />
        </div>
        <p className="mx-auto mt-3.5 max-w-[30ch] text-sm text-muted-foreground">
          {emptyLine}
        </p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-divider">
      {threads.map((thread) => {
        const selected = thread.id === selectedId
        const queued = isQueuedThread(thread)
        const names = withNames(thread)
        const preview = plainText(thread.last_message ?? '')
        return (
          <li key={thread.id}>
            <button
              type="button"
              onClick={() => onSelect(thread)}
              aria-current={selected || undefined}
              className={cn(
                'block w-full cursor-pointer px-4 py-3.5 text-left transition-colors',
                selected ? 'bg-brand/10' : 'hover:bg-foreground/5',
              )}
            >
              <div className="flex items-baseline gap-2.5">
                <div
                  className={cn(
                    'min-w-0 flex-1 truncate font-heading text-sm',
                    thread.unread > 0 ? 'font-extrabold' : 'font-bold',
                  )}
                >
                  {threadHeading(thread)}
                </div>
                {thread.unread > 0 && (
                  <span className="grid h-4.25 min-w-4.25 flex-none place-items-center rounded-full bg-brand px-1 font-heading text-2xs font-extrabold tabular-nums text-white">
                    {thread.unread}
                  </span>
                )}
              </div>

              {names && (
                <div className="mt-0.5 truncate text-2xs text-muted-foreground">
                  {names}
                </div>
              )}

              {/*
                Two lines of preview under the subject, so the markup comes off
                rather than being drawn: a body is written in the editor now,
                and the school echoes it back into `last_message` as it was
                stored. Clamping HTML would have put `<p>` at the top of every
                row in the list.
              */}
              {preview && (
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {preview}
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {/* The school sends this already formatted for a reader and
                    with no zone, so it is shown exactly as it arrived rather
                    than parsed into a date this app would then re-format. */}
                {thread.last_message_at && (
                  <span className="text-2xs tabular-nums text-muted-foreground">
                    {thread.last_message_at}
                  </span>
                )}
                {thread.about && (
                  <Tag variant="neutral">About {thread.about}</Tag>
                )}
                {thread.status === 'closed' && <Tag variant="neutral">Closed</Tag>}
                {queued && <Tag variant="accent">Waiting to send</Tag>}
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
