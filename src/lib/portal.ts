import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Notification } from '@/features/notifications/types'

export type PortalRole = 'admin' | 'teacher' | 'student' | 'parent'

export type NavItem = {
  /** Absolute route path, e.g. `/admin/students`. */
  to: string
  label: string
  icon: LucideIcon
  badge?: string
}

export type NavGroup = {
  /** Omitted for the ungrouped block at the top of the sidebar. */
  heading?: string
  items: NavItem[]
}

export type AccountSummary = {
  name: string
  /** The line under the name in the account menu, e.g. "Bursar · Full access". */
  line: string
  initials: string
}

/**
 * Everything the shell needs to render a portal. Adding a portal means adding
 * one of these — the shell itself never learns about roles.
 */
export type PortalConfig = {
  role: PortalRole
  /** Sits under the brand mark, e.g. "Bronze · Admin". */
  roleLabel: string
  basePath: string
  nav: NavGroup[]
  account: AccountSummary
  /** Sidebar block between the brand and the nav. */
  context?: ReactNode
  /** Right-hand status text in the header. */
  headerStatus?: ReactNode
  /** Admin filters its long nav with a search box; the others do not. */
  searchableNav?: boolean
  notifications: Notification[]
  /** The extra filter offered on the notifications page, e.g. "Finance". */
  notificationCategory: string
}
