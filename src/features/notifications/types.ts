export type Notification = {
  id: string
  /** Category, shown as a small tag and used by the filter. */
  kicker: string
  title: string
  body: string
  when: string
  group: 'Today' | 'Earlier'
  /**
   * The page opening the item routes to. Absent where the item *is* the
   * content — a notice off the board says what it says and leads nowhere.
   */
  to?: string
  /**
   * When it happened, in epoch millis. Carried so two feeds worked out
   * separately can be merged into one order; the row reads `when` instead.
   */
  at?: number
  /**
   * A second line under the body — who posted it and how far it reached.
   * Only the notice board has one; everything else on a feed is a record read
   * as an event, with no person behind it.
   */
  meta?: string
  /** The notice board id, where this came off `/notifications/mine`. */
  noticeId?: number
  /** The server's own read flag, where the item has one. */
  read?: boolean
}
