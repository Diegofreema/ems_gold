import { create } from 'zustand'

type NotificationsState = {
  /** Ids the user has opened or marked read. */
  read: Record<string, boolean>
  markRead: (id: string) => void
  markAllRead: (ids: string[]) => void
}

export const useNotificationsStore = create<NotificationsState>()((set) => ({
  read: {},
  markRead: (id) => set((state) => ({ read: { ...state.read, [id]: true } })),
  markAllRead: (ids) =>
    set((state) => ({
      read: { ...state.read, ...Object.fromEntries(ids.map((id) => [id, true])) },
    })),
}))

/** Convenience selector — the bell badge and the page both need this. */
export function useUnread(notifications: { id: string }[]) {
  const read = useNotificationsStore((state) => state.read)
  return notifications.filter((notification) => !read[notification.id])
}
