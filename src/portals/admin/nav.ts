import {
  BadgeDollarSign,
  Bell,
  Book,
  BookOpen,
  Briefcase,
  Building2,
  CalendarCheck,
  CalendarDays,
  Check,
  ChartColumn,
  ChartLine,
  ClipboardCheck,
  CreditCard,
  FileText,
  House,
  LayoutGrid,
  List,
  Mail,
  Shield,
  SlidersHorizontal,
  SquareCheckBig,
  UserPlus,
  Users,
} from 'lucide-react'
import type { NavGroup } from '@/lib/portal'

export const adminNav: NavGroup[] = [
  {
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutGrid },
      { to: '/admin/notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    heading: 'Finance',
    items: [
      { to: '/admin/fees', label: 'Fee catalogue', icon: BadgeDollarSign },
      { to: '/admin/collect', label: 'Fee collection', icon: CreditCard, badge: '18' },
      { to: '/admin/invoices', label: 'Invoices', icon: FileText },
      { to: '/admin/spendings', label: 'Spendings', icon: ChartLine },
      { to: '/admin/analytics', label: 'Analytics', icon: ChartColumn },
    ],
  },
  {
    heading: 'Students',
    items: [
      { to: '/admin/students', label: 'Enrolled', icon: Users },
      { to: '/admin/applicants', label: 'Applicants', icon: UserPlus, badge: '37' },
      { to: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
      { to: '/admin/att-report', label: 'Attendance report', icon: FileText },
    ],
  },
  {
    heading: 'Staff',
    items: [
      { to: '/admin/staff', label: 'Manage staff', icon: Briefcase },
      { to: '/admin/staff-admin', label: 'Administrators', icon: Shield },
      { to: '/admin/staff-teachers', label: 'Teachers', icon: BookOpen },
      { to: '/admin/staff-other', label: 'Other staff', icon: Users },
    ],
  },
  {
    heading: 'Parents',
    items: [
      { to: '/admin/parents', label: 'All parents', icon: House },
      { to: '/admin/parents-owing', label: 'Owing', icon: CreditCard },
      { to: '/admin/parents-cleared', label: 'Cleared', icon: Check },
      { to: '/admin/parents-invited', label: 'Not yet signed up', icon: Mail },
    ],
  },
  {
    heading: 'Academics',
    items: [
      { to: '/admin/classes', label: 'Classes & arms', icon: Building2 },
      { to: '/admin/subjects', label: 'Subjects', icon: BookOpen },
      { to: '/admin/calendar', label: 'Sessions & terms', icon: CalendarDays },
      { to: '/admin/results', label: 'Results', icon: ClipboardCheck },
    ],
  },
  {
    heading: 'School',
    items: [
      { to: '/admin/library', label: 'Library', icon: Book },
      { to: '/admin/elections', label: 'Elections', icon: SquareCheckBig },
      { to: '/admin/privileges', label: 'Roles & privileges', icon: Shield },
      { to: '/admin/logs', label: 'Activity log', icon: List },
      { to: '/admin/settings', label: 'Settings', icon: SlidersHorizontal },
    ],
  },
]
