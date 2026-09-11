import { useLiveQuery } from '@tanstack/react-db'
import { MessageSquarePlus, Search } from 'lucide-react'
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs'
import { useState } from 'react'
import { useCloseConversation } from '@/api/conversations/hooks'
import type { Contact, ConversationSummary } from '@/api/conversations/types'
import { SegmentedControl } from '@/components/common/segmented-control'
import { EmptyState } from '@/components/feedback/empty-state'
import { PageHeader } from '@/components/page/page-header'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { msgContacts, msgInbox } from '@/db/collections/messages'
import { useHeld, useHeldDocument } from '@/db/live'
import type { OutboxOp } from '@/db/outbox'
import { outbox } from '@/db/store'
import type { Option } from '@/features/collections/options'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { useSessionStore } from '@/stores/session.store'
import { filterCounts, THREAD_FILTERS, type ThreadFilter, visibleThreads } from '../inbox'
import { queuedReplies, queuedThreads } from '../queued'
import { ComposeDialog } from './compose-dialog'
import { ThreadList } from './thread-list'
import { ThreadView } from './thread-view'

/**
 * The messages screen, shared by the office, the staff room and the guardian.
 *
 * One component for three portals because the answer is the same in all three:
 * the school works out who each account may write to and what threads they are
 * on, so nothing here is per-role except whether the reader may close a thread
 * and whether they have children to name one about.
 *
 * A student has no page of this kind, and that is the API's decision rather than
 * an omission — a student's contacts list is empty, because their messages to
 * the school go through their guardian.
 *
 * Everything on screen is read off the device: the threads, the last message
 * on each and the address book behind the composer. Only the messages inside
 * an open thread need a connection, and the panel says so where there is none
 * rather than spinning.
 */
export function MessagesPage({
  kicker,
  description,
  canClose = false,
  childOptions,
  childLabel,
}: {
  kicker: string
  description: string
  /** The office alone may close a thread. */
  canClose?: boolean
  /** The reader's own children, where the portal knows them. */
  childOptions?: Option[]
  childLabel?: string
}) {
  const [state, setState] = useQueryStates({
    thread: parseAsString.withDefault(''),
    status: parseAsStringLiteral(THREAD_FILTERS).withDefault('open'),
    q: parseAsString.withDefault(''),
  })
  const [composing, setComposing] = useState(false)
  const narrow = useBreakpoint('narrow')

  const inbox = useHeldDocument(msgInbox)
  const contacts = useHeld<Contact, number>(msgContacts)
  const queue = useLiveQuery({ query: (q) => q.from({ op: outbox() }) })
  const ops = (queue.data ?? []) as OutboxOp[]
  const meId = useSessionStore((session) => session.account?.user?.id)
  const closeThread = useCloseConversation()

  /**
   * The school's threads, with anything started on this device in front of
   * them — to the person who wrote it, a message waiting to send is a
   * conversation, and leaving it off the list until the school answers is how
   * somebody comes to write it twice.
   *
   * Recomputed rather than memoised: it is a concatenation over an inbox and a
   * queue, both of which are a handful of rows, and the live query hands back
   * a new array every render anyway — so a memo here would be a dependency
   * that never matches, doing the work twice.
   */
  const threads = [...queuedThreads(ops), ...(inbox.doc?.conversations ?? [])]

  const counts = filterCounts(threads)
  const shown = visibleThreads(threads, state.status, state.q)
  const selected =
    shown.find((thread) => String(thread.id) === state.thread) ??
    threads.find((thread) => String(thread.id) === state.thread) ??
    null

  const select = (thread: ConversationSummary) =>
    void setState({ thread: String(thread.id) })

  const header = (
    <>
      <PageHeader
        kicker={kicker}
        title="Messages"
        description={description}
        action={
          <Button onClick={() => setComposing(true)}>
            <MessageSquarePlus className="size-4" strokeWidth={2} />
            New message
          </Button>
        }
      />
      <Rule />
    </>
  )

  // Never synced, and no connection to sync now. Distinct from an empty inbox,
  // which is a real and common answer — saying "no messages" over a set this
  // device has never seen is the one wrong thing this page could say.
  if (inbox.failed && !inbox.doc) {
    return (
      <div>
        {header}
        <EmptyState
          title="Your messages are not on this device yet"
          body="This device has never been able to fetch your conversations, and cannot reach the school now. Open this page once with a connection and they will be here from then on, signal or no signal."
        />
      </div>
    )
  }

  return (
    <div>
      {header}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SegmentedControl<ThreadFilter>
          name="messages-filter"
          value={state.status}
          onChange={(status) => void setState({ status })}
          options={THREAD_FILTERS.map((filter) => ({
            value: filter,
            label: `${LABELS[filter]} (${counts[filter]})`,
          }))}
        />
        <div className="relative min-w-[13rem] flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            strokeWidth={2}
          />
          <Input
            value={state.q}
            onChange={(event) => void setState({ q: event.target.value })}
            placeholder="Search subjects and names"
            aria-label="Search your conversations"
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)]">
        {/* On a narrow screen the two panes are one: opening a thread replaces
            the list, and the thread's own back button returns to it. */}
        {(!narrow || !selected) && (
          <div className="overflow-hidden rounded-xl border border-divider bg-raised shadow-card">
            <ThreadList
              threads={shown}
              selectedId={selected?.id ?? null}
              onSelect={select}
              emptyLine={
                threads.length === 0
                  ? 'No conversations yet. Start one with the button above.'
                  : state.q
                    ? `Nothing matches “${state.q}”.`
                    : `Nothing ${LABELS[state.status].toLowerCase()} here.`
              }
            />
          </div>
        )}

        {(!narrow || selected) &&
          (selected ? (
            <ThreadView
              // Keyed on the thread, so switching conversations starts the
              // panel afresh rather than showing the last one's reply box.
              key={selected.id}
              thread={selected}
              meId={meId}
              queued={queuedReplies(ops, selected.id)}
              onBack={() => void setState({ thread: '' })}
              onClose={() => closeThread.mutate(selected.id)}
              closing={closeThread.isPending}
              canClose={canClose}
            />
          ) : (
            <div className="hidden place-items-center rounded-xl border border-dashed border-divider px-6 py-16 text-center lg:grid">
              <div className="max-w-[34ch]">
                <div className="font-heading text-base font-extrabold">
                  Nothing open
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Choose a conversation on the left to read it, or start a new
                  one. Opening a conversation marks it read.
                </p>
              </div>
            </div>
          ))}
      </div>

      <ComposeDialog
        open={composing}
        onOpenChange={setComposing}
        contacts={contacts.rows}
        contactsFailed={contacts.failed && contacts.rows.length === 0}
        childOptions={childOptions}
        childLabel={childLabel}
      />
    </div>
  )
}

const LABELS: Record<ThreadFilter, string> = {
  open: 'Open',
  closed: 'Closed',
  all: 'All',
}
