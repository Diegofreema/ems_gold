import {
  Bell,
  BookOpen,
  CalendarDays,
  ChartLine,
  CreditCard,
  FileText,
  LayoutGrid,
  SquareCheckBig,
} from 'lucide-react'
import type { NavGroup } from '@/lib/portal'

export const studentNav: NavGroup[] = [
  {
    items: [
      { to: '/student', label: 'Dashboard', icon: LayoutGrid },
      { to: '/student/notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    heading: 'Learning',
    items: [
      { to: '/student/courses', label: 'My courses', icon: BookOpen },
      { to: '/student/materials', label: 'Course materials', icon: FileText },
      { to: '/student/timetable', label: 'My timetable', icon: CalendarDays },
    ],
  },
  {
    heading: 'Assessment',
    items: [
      { to: '/student/tests', label: 'Tests open to me', icon: SquareCheckBig },
      { to: '/student/results', label: 'My results', icon: ChartLine },
    ],
  },
  {
    heading: 'Finance',
    items: [
      { to: '/student/invoices', label: 'My invoices', icon: CreditCard },
    ],
  },
]
