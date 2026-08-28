import { createFileRoute } from '@tanstack/react-router'
import { MessageForm } from '@/portals/teacher/features/messages/message-form'
import { MESSAGE_ADMIN } from '@/portals/teacher/features/messages/targets'

export const Route = createFileRoute('/teacher/msg-admin')({
  staticData: { title: 'Message the admin', crumb: 'Messages' },
  component: () => <MessageForm target={MESSAGE_ADMIN} />,
})
