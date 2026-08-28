import { createFileRoute } from '@tanstack/react-router'
import { MessageForm } from '@/portals/teacher/features/messages/message-form'
import { MESSAGE_STUDENTS } from '@/portals/teacher/features/messages/targets'

export const Route = createFileRoute('/teacher/msg-students')({
  staticData: { title: 'Message my students', crumb: 'Messages' },
  component: () => <MessageForm target={MESSAGE_STUDENTS} />,
})
