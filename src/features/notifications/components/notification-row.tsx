import { Link } from '@tanstack/react-router'
import { Tag } from '@/components/common/tag'
import { cn } from '@/lib/utils'
import { useNotificationsStore } from '../notifications.store'
import type { Notification } from '../types'

/**
 * One item. Unread rows carry a 6% accent wash, a filled square and a bolder
 * title; opening one marks it read and routes to the page it came from.
 */
export function NotificationRow({
  notification,
  index,
  compact,
  onOpen,
}: {
  notification: Notification
  index: number
  /** The header panel uses the tighter variant. */
  compact?: boolean
  onOpen?: () => void
}) {
  const read = useNotificationsStore((state) => state.read[notification.id])
  const markRead = useNotificationsStore((state) => state.markRead)

  return (
    <Link
      to={notification.to}
      onClick={() => {
        markRead(notification.id)
        onOpen?.()
      }}
      style={{ animationDelay: `${index * 34}ms` }}
      className={cn(
        'flex w-full animate-ems-row gap-3.5 border-b border-divider text-left !text-foreground transition-[background-color,padding-left] duration-150 hover:bg-neutral-100',
        compact ? 'px-4 py-3.5' : 'px-2 py-4 hover:pl-3.5',
        !read && 'bg-brand/6',
      )}
    >
      <div
        className={cn(
          'mt-[7px] size-2 flex-none',
          read ? 'bg-neutral-300' : 'bg-brand',
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2.5">
          <div
            className={cn(
              compact ? 'text-[13.5px]' : 'text-[15px]',
              read ? 'font-normal' : 'font-bold',
            )}
          >
            {notification.title}
          </div>
          {!compact && (
            <Tag variant="neutral" className="px-1.5 py-px text-[10px]">
              {notification.kicker}
            </Tag>
          )}
        </div>
        <div className="mt-1 text-[13px] leading-normal text-muted-foreground">
          {notification.body}
        </div>
        {compact && (
          <div className="mt-1.5 text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
            {notification.when}
          </div>
        )}
      </div>
      {!compact && (
        <div className="flex-none text-[11.5px] tabular-nums text-muted-foreground">
          {notification.when}
        </div>
      )}
    </Link>
  )
}
