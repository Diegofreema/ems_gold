export type Notification = {
  id: string
  /** Category, shown as a small tag and used by the filter. */
  kicker: string
  title: string
  body: string
  when: string
  group: 'Today' | 'Earlier'
  /** The page opening the item routes to. */
  to: string
}
