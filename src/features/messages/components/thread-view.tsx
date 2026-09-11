import { ArrowLeft, Lock, Send } from 'lucide-react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { useConversation } from '@/api/conversations/hooks';
import type { ConversationSummary } from '@/api/conversations/types';
import { Tag } from '@/components/common/tag';
import { Shimmer } from '@/components/feedback/shimmer';
import { Button } from '@/components/ui/button';
import { refetchCollection } from '@/db/collection';
import { SET } from '@/db/ids';
import { hasText, isRichText } from '@/features/collections/rich-text';
import { errorMessage, OFFLINE_MESSAGE } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { threadHeading, withNames } from '../inbox';
import { isQueuedThread } from '../queued';
import { queueReply } from '../send';
import {
  isReadableThread,
  threadMessages,
  threadStatus,
  threadSubject,
} from '../thread';
import type { ThreadMessage } from '../thread';

/**
 * Both halves of the editor are fetched only once somebody opens a
 * conversation — it is a large dependency, and the inbox list itself needs
 * neither. The reader is the editor with typing turned off, which is also
 * what sanitises a body: it is parsed against the schema in
 * `@/components/editor/extensions` rather than set as HTML on an element.
 */
const RichTextEditor = lazy(() =>
  import('@/components/editor/rich-text-editor').then((module) => ({
    default: module.RichTextEditor,
  })),
);

const RichTextView = lazy(() =>
  import('@/components/editor/rich-text-view').then((module) => ({
    default: module.RichTextView,
  })),
);

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
  thread: ConversationSummary;
  /** The reader's own `user_id`, so their messages sit on their own side. */
  meId: number | undefined;
  /** Replies written on this device that the school has not heard. */
  queued: ThreadMessage[];
  onBack: () => void;
  onClose: () => void;
  closing: boolean;
  /** The office alone may close a thread. */
  canClose: boolean;
}) {
  const unsent = isQueuedThread(thread);
  const { data, isPending, error } = useConversation(thread.id, !unsent);

  /**
   * Fetching the thread marked it read at the school, so the inbox on the
   * device is now a minute out of date about its own badge. Resynced here
   * rather than waited for: the number the reader is watching is the one they
   * just cleared.
   */
  useEffect(() => {
    if (data) void refetchCollection(SET.msgInbox).catch(() => undefined);
  }, [data]);

  const subject = threadSubject(data, threadHeading(thread));
  const status = threadStatus(data, thread.status ?? 'open');
  const closed = status === 'closed';
  const names = withNames(thread);
  const messages = [...threadMessages(data, meId), ...queued];

  return (
    /*
      `h-full` inside the page's bounded grid, so the conversation fills the
      pane and scrolls its own messages — the reply box stays at the foot of
      the panel where it can be reached, rather than at the foot of a page as
      tall as the inbox is long. `min-h-0` is what actually lets the message
      list shrink: a flex child will not go below its content without it, and
      the panel would grow instead of scrolling.
    */
    <div className="flex min-h-112 flex-col overflow-hidden rounded-xl border border-divider bg-raised shadow-card lg:h-full lg:min-h-0">
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
          <h3 className="truncate font-heading text-base font-extrabold">
            {subject}
          </h3>
          <p className="mt-0.5 truncate text-2xs text-muted-foreground">
            {names || 'The school'}
            {thread.about ? ` · about ${thread.about}` : ''}
          </p>
        </div>

        {closed && <Tag variant="neutral">Closed</Tag>}
        {canClose && !closed && !unsent && (
          <Button
            variant="outline"
            size="sm"
            pending={closing}
            onClick={onClose}
          >
            Close thread
          </Button>
        )}
      </header>

      <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-4.5 py-4.5">
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
            Something went wrong with this conversation, so the messages are not
            shown. Nothing is lost — tell your ICT desk, and write below as
            usual.
          </Note>
        ) : messages.length === 0 ? (
          <Note>Nothing has been said in this conversation yet.</Note>
        ) : (
          messages.map((message) => (
            <Bubble key={message.key} message={message} />
          ))
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
  );
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
            'animate-ems-up rounded-xl px-3.5 py-2.5 text-sm leading-relaxed',
            // Only the plain branch honours the newlines somebody typed; the
            // written one carries its own paragraphs, and pre-wrap on top of
            // them doubles every gap.
            !isRichText(message.body) && 'whitespace-pre-wrap',
            message.mine
              ? 'bg-brand text-white'
              : 'border border-divider bg-background',
            message.queued && 'opacity-70',
          )}
        >
          {/*
            The same field holds both, and which it is has to be asked rather
            than assumed: a message sent before the editor was put here is the
            sentence somebody typed, and one sent since is HTML. Drawing the
            second as text shows `<p>` to a parent; drawing the first through
            the editor is a paragraph either way.
          */}
          {!message.body ? (
            <span className="opacity-70">(no text)</span>
          ) : isRichText(message.body) ? (
            <Suspense fallback={<div className="h-5 animate-ems-fade" />}>
              <RichTextView html={message.body} />
            </Suspense>
          ) : (
            message.body
          )}
        </div>
        {message.queued && (
          <div className="mt-1 text-right text-2xs text-muted-foreground">
            Waiting to send
          </div>
        )}
      </div>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-divider bg-background px-4 py-3.5 text-sm leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

/**
 * The reply box.
 *
 * Written in the editor, so a reply can carry a list of three things the way
 * the message it answers did. That moves what Enter means: it makes a new
 * paragraph, as it does in every other written field in this app, and
 * **Ctrl/Cmd + Enter sends** — the shortcut a rich composer has everywhere.
 * The button is there for anybody who wants nothing to do with either.
 *
 * Sending is synchronous — the write is accepted on the device — so the box
 * empties immediately and the reply appears above it as queued.
 */
function ReplyBox({
  threadId,
  subject,
}: {
  threadId: number;
  subject: string;
}) {
  const [body, setBody] = useState('');

  const send = () => {
    // An emptied editor still hands back `<p></p>`, which a trim would call a
    // reply and send as one.
    if (!hasText(body)) return;
    queueReply(threadId, { body }, subject);
    setBody('');
  };

  return (
    <div className="border-t border-divider px-4.5 py-3.5">
      <div
        className="flex items-end gap-2.5"
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            send();
          }
        }}
      >
        <div className="min-w-0 flex-1">
          <Suspense
            fallback={
              <div className="h-24 animate-ems-fade rounded-lg border border-input" />
            }
          >
            <RichTextEditor
              value={body}
              onChange={(html) => setBody(hasText(html) ? html : '')}
              placeholder="Write a reply…"
              minHeightClass="min-h-16"
            />
          </Suspense>
        </div>
        <Button
          onClick={send}
          disabled={!hasText(body)}
          aria-label="Send the reply"
        >
          <Send className="size-4" strokeWidth={2} />
          Send
        </Button>
      </div>
      <p className="mt-1.5 text-2xs text-muted-foreground">
        Ctrl + Enter sends · Enter starts a new line. With no connection the
        reply is kept on this device and sent when there is a signal.
      </p>
    </div>
  );
}
