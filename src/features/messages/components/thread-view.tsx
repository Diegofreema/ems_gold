import { ArrowLeft, Lock, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useConversation } from '@/api/conversations/hooks'
import type { ConversationSummary } from '@/api/conversations/types'
import { Tag } from '@/components/common/tag'
import { Shimmer } from '@/components/feedback/shimmer'
import { Button } from '@/components/ui/button'
import { refetchCollection } from '@/db/collection'
import { SET } from '@/db/ids'
import { errorMessage, OFFLINE_MESSAGE } from '@/lib/errors'
import { cn } from '@/lib/utils'
import { threadHeading, withNames } from '../inbox'
import { isQueuedThread } from '../queued'
import { queueReply } from '../send'
import { isReadableThread, threadMessages, threadStatus, threadSubject } from '../thread'
import type { ThreadMessage } from '../thread'

/**
 * One conversation, and the box to answer it in.
 *
 * The row behind this panel is on the device; the messages are not — opening
 * a thread marks it read, so it cannot be a set that refetches on a schedule.
 * That difference is the whole design of this panel: with no connection it
 * says so in a sentence and still shows the last message and the reply box,
 * because a reply written now is queued and goes when the signal comes back.
 */
export function ThreadView({
  thread,
  meId,
  queued,
  onBack,
  onClose,
  closing,
  canClose,
}: {
  thread: ConversationSummary
  /** The reader's own `user_id`, so their messages sit on their own side. */
  meId: number | undefined
  /** Replies written on this device that the school has not heard. */
  queued: ThreadMessage[]
  onBack: () => void
  onClose: () => void
  closing: boolean
  /** The office alone may close a thread. */
  canClose: boolean
}) {
  const unsent = isQueuedThread(thread)
  const { data, isPending, error } = useConversation(thread.id, !unsent)

  /**
   * Fetching the thread marked it read at the school, so the inbox on the
   * device is now a minute out of date about its own badge. Resynced here
   * rather than waited for: the number the reader is watching is the one they
   * just cleared.
   */
  useEffect(() => {
    if (data) void refetchCollection(SET.msgInbox).catch(() => undefined)
  }, [data])

  const subject = threadSubject(data, threadHeading(thread))
  const status = threadStatus(data, thread.status ?? 'open')
  const closed = status === 'closed'
  const names = withNames(thread)
  const messages = [...threadMessages(data, meId), ...queued]

  return (
    <div className="flex min-h-[28rem] flex-col rounded-xl border border-divider bg-raised shadow-card">
      <header className="flex flex-wrap items-start gap-3 border-b border-divider px-4.5 py-3.5">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          aria-label="Back to the list"
          className="lg:hidden"
        >
          <ArrowLeft className="size-4" strokeWidth={2} />
        </Button>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-heading text-base font-extrabold">{subject}</h3>
          <p className="mt-0.5 truncate text-2xs text-muted-foreground">
            {names || 'The school'}
            {thread.about ? ` · about ${thread.about}` : ''}
          </p>
        </div>

        {closed && <Tag variant="neutral">Closed</Tag>}
        {canClose && !closed && !unsent && (
          <Button variant="outline" size="sm" pending={closing} onClick={onClose}>
            Close thread
          </Button>
        )}
      </header>

      <div className="flex-1 space-y-3.5 overflow-y-auto px-4.5 py-4.5">
        {unsent ? (
          <Note>
            This message is still on this device, waiting for a connection. It
            opens as a conversation once the school has it, and the reply from
            the other side arrives here.
          </Note>
        ) : isPending ? (
          <div className="space-y-3">
            <Shimmer className="h-16 w-3/4 rounded-lg" />
            <Shimmer className="ml-auto h-14 w-2/3 rounded-lg" delay={90} />
            <Shimmer className="h-16 w-3/4 rounded-lg" delay={180} />
          </div>
        ) : error ? (
          <Note>
            {errorMessage(error, OFFLINE_MESSAGE)} The messages themselves need
            a connection — the last one is on the row beside this. Anything you
            write below is kept on this device and sent when there is a signal.
          </Note>
        ) : !isReadableThread(data) ? (
          <Note>
            The school sent this conversation in a shape this app cannot read
            yet, so the messages are not shown. Nothing is lost — tell your ICT
            desk, and write below as usual.
          </Note>
        ) : messages.length === 0 ? (
          <Note>Nothing has been said in this conversation yet.</Note>
        ) : (
          messages.map((message) => <Bubble key={message.key} message={message} />)
        )}
      </div>

      {closed ? (
        <div className="flex items-center gap-2.5 border-t border-divider px-4.5 py-3.5 text-xs text-muted-foreground">
          <Lock className="size-3.5 flex-none" strokeWidth={2} />
          The office closed this conversation, so it takes no more replies.
          Start a new one if there is more to say.
        </div>
      ) : unsent ? null : (
        <ReplyBox subject={subject} threadId={thread.id} />
      )}
    </div>
  )
}

/** One message. The reader's own sit on the right, in brand; everyone else's left. */
function Bubble({ message }: { message: ThreadMessage }) {
  return (
    <div className={cn('flex', message.mine ? 'justify-end' : 'justify-start')}>
      <div className="max-w-[min(46ch,85%)]">
        {(message.senderName || message.at) && (
          <div
            className={cn(
              'mb-1 flex items-baseline gap-2 text-2xs text-muted-foreground',
              message.mine && 'justify-end',
            )}
          >
            {message.senderName && <span>{message.senderName}</span>}
            {/* Shown as the school stamped it — see `last_message_at`. */}
            {message.at && <span className="tabular-nums">{message.at}</span>}
          </div>
        )}
        <div
          className={cn(
            'animate-ems-up rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
            message.mine
              ? 'bg-brand text-white'
              : 'border border-divider bg-background',
            message.queued && 'opacity-70',
          )}
        >
          {message.body || <span className="opacity-70">(no text)</span>}
        </div>
        {message.queued && (
          <div className="mt-1 text-right text-2xs text-muted-foreground">
            Waiting to send
          </div>
        )}
      </div>
    </div>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-divider bg-background px-4 py-3.5 text-sm leading-relaxed text-muted-foreground">
      {children}
    </p>
  )
}

/**
 * The reply box.
 *
 * Enter sends and Shift+Enter makes a new line, which is what everybody who
 * has ever used a messaging app expects; the button is there for anybody who
 * does not. Sending is synchronous — the write is accepted on the device — so
 * the box empties immediately and the reply appears above it as queued.
 */
function ReplyBox({ threadId, subject }: { threadId: number; subject: string }) {
  const [body, setBody] = useState('')
  const box = useRef<HTMLTextAreaElement>(null)

  const send = () => {
    const text = body.trim()
    if (!text) return
    queueReply(threadId, { body: text }, subject)
    setBody('')
    box.current?.focus()
  }

  return (
    <div className="border-t border-divider px-4.5 py-3.5">
      <div className="flex items-end gap-2.5">
        <textarea
          ref={box}
          rows={2}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              send()
            }
          }}
          placeholder="Write a reply…"
          aria-label="Write a reply"
          className="min-h-[2.75rem] flex-1 resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <Button onClick={send} disabled={!body.trim()} aria-label="Send the reply">
          <Send className="size-4" strokeWidth={2} />
          Send
        </Button>
      </div>
      <p className="mt-1.5 text-2xs text-muted-foreground">
        Enter sends · Shift + Enter starts a new line. With no connection the
        reply is kept on this device and sent when there is a signal.
      </p>
    </div>
  )
}
