import { createFileRoute } from '@tanstack/react-router'
import { ProfilePage } from '@/features/profile/profile-page'
import { studentProfile } from '@/portals/student/profile'

export const Route = createFileRoute('/student/profile')({
  staticData: { title: 'My profile', crumb: 'My account' },
  component: () => <ProfilePage config={studentProfile} />,
})
