import type { MessageTarget } from './message-form'

export const MESSAGE_ADMIN: MessageTarget = {
  title: 'Message the admin',
  description:
    'Goes to the school office. Use this for anything that needs a record.',
  toLabel: 'To',
  toValue: 'School office — NETPRO EMS Bronze',
  bodyHint: 'The office replies in the portal and by email.',
}

export const MESSAGE_STUDENTS: MessageTarget = {
  title: 'Message my students',
  description:
    'Goes to every pupil registered to the arm you pick, and to their parents.',
  toLabel: 'To',
  toValue: 'SS1 A — 35 pupils',
  bodyHint:
    'Write your message. Parents receive it by email and in the parent portal.',
}
