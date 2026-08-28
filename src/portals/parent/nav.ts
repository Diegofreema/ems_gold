import {
  Bell,
  CalendarCheck,
  CreditCard,
  FileText,
  LayoutGrid,
  MessageSquare,
  PenLine,
  Receipt,
  SquareCheckBig,
  Users,
} from 'lucide-react'
import type { NavGroup } from '@/lib/portal'

export const parentNav: NavGroup[] = [
  {
    items: [
      { to: '/parent', label: 'Dashboard', icon: LayoutGrid },
      { to: '/parent/notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    heading: 'My children',
    items: [
      { to: '/parent/children', label: 'My children', icon: Users },
      { to: '/parent/results', label: 'Results', icon: SquareCheckBig },
      { to: '/parent/attendance', label: 'Attendance', icon: CalendarCheck },
    ],
  },
  {
    heading: 'Messages',
    items: [
      { to: '/parent/msg-school', label: 'Message the school', icon: MessageSquare },
    ],
  },
  {
    heading: 'Finance',
    items: [
      { to: '/parent/pay', label: 'Pay fees', icon: CreditCard, badge: '2' },
      { to: '/parent/invoices', label: 'Invoices', icon: FileText },
      { to: '/parent/receipts', label: 'Receipts', icon: Receipt },
    ],
  },
  {
    heading: 'Tests',
    items: [
      { to: '/parent/tests', label: 'Tests for my children', icon: PenLine },
    ],
  },
]
