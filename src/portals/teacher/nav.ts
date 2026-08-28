import {
  Bell,
  BookOpen,
  LayoutGrid,
  List,
  MessageSquare,
  Monitor,
  PenLine,
  SquareCheckBig,
  Upload,
  Users,
} from 'lucide-react'
import type { NavGroup } from '@/lib/portal'

export const teacherNav: NavGroup[] = [
  {
    items: [
      { to: '/teacher', label: 'Dashboard', icon: LayoutGrid },
      { to: '/teacher/notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    heading: 'Teaching',
    items: [
      { to: '/teacher/subjects', label: 'My subjects', icon: BookOpen },
      { to: '/teacher/students', label: 'My students', icon: Users },
      { to: '/teacher/topics', label: 'Topics taught', icon: List },
      { to: '/teacher/eclasses', label: 'E-classes', icon: Monitor },
    ],
  },
  {
    heading: 'Assessment',
    items: [
      { to: '/teacher/scores', label: 'Enter scores', icon: PenLine, badge: '2' },
      { to: '/teacher/uploads', label: 'Upload batches', icon: Upload },
      { to: '/teacher/results', label: 'Browse results', icon: SquareCheckBig },
    ],
  },
  {
    heading: 'Messages',
    items: [
      { to: '/teacher/msg-admin', label: 'Message admin', icon: MessageSquare },
      { to: '/teacher/msg-students', label: 'Message my students', icon: MessageSquare },
    ],
  },
]
