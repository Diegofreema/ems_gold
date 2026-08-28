import { createFileRoute } from '@tanstack/react-router'
import { ProfilePage } from '@/features/profile/profile-page'
import { teacherProfile } from '@/portals/teacher/profile'

export const Route = createFileRoute('/teacher/profile')({
  staticData: { title: 'My profile', crumb: 'My account' },
  component: () => <ProfilePage config={teacherProfile} />,
})
