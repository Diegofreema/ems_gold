import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef } from 'react'
import { useMyNotices, useUnreadNoticeCount } from '@/api/notifications/hooks'
import { noticeKeys } from '@/api/notifications/keys'
import { errorMessage } from '@/lib/errors'
import { noticeFeed } from './notice-feed'
import type { Notification } from './types'

/** How many notices the board is asked for at once. */
const BOARD = 25

/**
 * Keeping the board fresh for the price of one integer.
 *
 * `/notifications/unread-count` is polled rather than the list, because a
 * notice posted while somebody has the tab open is the one worth arriving on
 * its own and the count is a fraction of the size. When the number moves —
 * either way; a notice can be deleted as well as posted — the list is
 * refetched, and only then.
 *
 * The first answer is remembered rather than acted on: it is not a change, it
 * is the number arriving for the first time.
 */
function useBoardWatch() {
  const queryClient = useQueryClient()
  const unread = useUnreadNoticeCount()
  const seen = useRef<number>(undefined)

  useEffect(() => {
    const count = unread.data
    if (count === undefined) return
    if (seen.current !== undefined && seen.current !== count) {
      void queryClient.invalidateQueries({ queryKey: noticeKeys.everyMine() })
    }
    seen.current = count
  }, [unread.data, queryClient])
}

/**
 * The office's own notices, as feed items — the half of every portal's bell
 * that somebody actually wrote.
 *
 * Read rather than loaded: a loader that awaited this would take the whole
 * shell down on a board that is unreachable. A failure here costs the board
 * and nothing else, so the derived half of the feed still draws and `error` is
 * handed back for the page to say so out loud rather than showing "you are up
 * to date", which would be a claim.
 */
export function useNoticeFeed(): {
  notices: Notification[]
  /** Why the board is missing, in words, or null where it is not. */
  error: string | null
} {
  const board = useMyNotices({ limit: BOARD })
  const data = board.data
  useBoardWatch()

  return useMemo(
    () => ({
      notices: noticeFeed(data ?? [], new Date()),
      error: board.error
        ? errorMessage(board.error, 'The notice board could not be reached.')
        : null,
    }),
    [data, board.error],
  )
}
