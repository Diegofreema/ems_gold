import { parseAsString, useQueryState } from 'nuqs'
import { useMemo } from 'react'
import { SectionHeading } from '@/components/common/section-heading'
import { SegmentedControl } from '@/components/common/segmented-control'
import { PageHeader } from '@/components/page/page-header'
import { Rule } from '@/components/page/rule'
import { Button } from '@/components/ui/button'
import { NotificationRow } from './components/notification-row'
import { useNotificationsStore } from './notifications.store'
import type { Notification } from './types'

const GROUPS = ['Today', 'Earlier'] as const

/** The full notification centre, grouped under Today and Earlier. */
export function NotificationsPage({
  notifications,
  description,
  /** The role-specific category offered alongside All and Unread. */
  category,
}: {
  notifications: Notification[]
  description: string
  category: string
}) {
  const [filter, setFilter] = useQueryState(
    'filter',
    parseAsString.withDefault('all'),
  )
  const read = useNotificationsStore((state) => state.read)
  const markAllRead = useNotificationsStore((state) => state.markAllRead)

  const visible = useMemo(() => {
    if (filter === 'unread') return notifications.filter((item) => !read[item.id])
    if (filter === 'category')
      return notifications.filter((item) => item.kicker === category)
    return notifications
  }, [notifications, filter, read, category])

  return (
    <div className="max-w-[780px]">
      <PageHeader
        kicker="School"
        title="Notifications"
        description={description}
        action={
          <Button
            variant="outline"
            onClick={() => markAllRead(notifications.map((item) => item.id))}
          >
            Mark all read
          </Button>
        }
      />
      <Rule />

      <SegmentedControl
        name="notification-filter"
        className="mb-5"
        value={filter}
        onChange={(value) => void setFilter(value === 'all' ? null : value)}
        options={[
          { value: 'all', label: 'All' },
          { value: 'unread', label: 'Unread' },
          { value: 'category', label: category },
        ]}
      />

      {visible.length === 0 ? (
        <div className="border-2 border-divider px-6 py-14 text-center">
          <div className="font-heading text-[17px] font-extrabold">
            Nothing to read
          </div>
          <p className="mt-2 text-[13.5px] text-muted-foreground">
            You are up to date. New notifications appear here as they arrive.
          </p>
        </div>
      ) : (
        GROUPS.map((group) => {
          const items = visible.filter((item) => item.group === group)
          if (items.length === 0) return null
          return (
            <div key={group} className="mb-6">
              <SectionHeading className="mb-2.5">{group}</SectionHeading>
              <div className="border-t-2 border-divider">
                {items.map((notification, index) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
